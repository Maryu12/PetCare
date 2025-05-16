from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import stripe
import os
from dotenv import load_dotenv
from ..models.database import SessionLocal
from ..models.models_db import Subscription
from ..models.schemas import SubscriptionCreate
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

router = APIRouter()

# Configuración Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

STRIPE_AMOUNTS = {
    "premium": int(os.getenv("STRIPE_PREMIUM_PRICE")),   # Cambia estos valores según tus precios reales
    "estandar": int(os.getenv("STRIPE_STANDARD_PRICE")),
    "basico": int(os.getenv("STRIPE_BASIC_PRICE"))
}

@router.post("/process-subscription")
async def process_subscription(data: SubscriptionCreate):
    db = SessionLocal()
    try:
        print("DATA RECIBIDA:", data)
        plan_key = data.plan.lower()
        amount = STRIPE_AMOUNTS.get(plan_key)
        if not amount:
            raise HTTPException(status_code=400, detail=f"Plan inválido: {data.plan}")

        # 1. Buscar o crear cliente en Stripe
        existing_customers = stripe.Customer.list(email=data.email).data
        if existing_customers:
            customer_id = existing_customers[0].id
        else:
            customer = stripe.Customer.create(
                email=data.email,
                name=data.name
            )
            customer_id = customer.id

        # 2. Crear PaymentIntent asociado al cliente
        payment_intent = stripe.PaymentIntent.create(
            amount=amount * 100,
            currency="cop",
            payment_method_types=["card"],
            receipt_email=data.email,
            description=f"Pago único plan {plan_key.capitalize()}",
            customer=customer_id
        )
        print("PAYMENT_INTENT:", payment_intent.id)

        # 3. Confirmar el PaymentIntent con el token de la tarjeta
        confirmed_intent = stripe.PaymentIntent.confirm(
            payment_intent.id,
            payment_method_data={
                "type": "card",
                "card": {
                    "token": data.stripe_token
                }
            },
        )
        print("CONFIRMED_INTENT:", confirmed_intent.id)

        # 3. Guardar en base de datos
        db_subscription = Subscription(
            name=data.name,
            email=data.email,
            plan=data.plan,
            stripetoken=confirmed_intent.id  # O puedes guardar el token de Stripe si prefieres: data.stripe_token
        )
        db.add(db_subscription)
        db.commit()

        # 4. Enviar email de confirmación
        await send_confirmation_email(
            data.email,
            data.name,
            data.plan,
            amount,
            confirmed_intent.id
        )

        return JSONResponse({
            "success": True,
            "payment_id": confirmed_intent.id
        })

    except stripe.error.StripeError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error de Stripe: {str(e)}")
    except Exception as e:
        db.rollback()
        print("ERROR EN EL SERVIDOR:", e)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    finally:
        db.close()

async def send_confirmation_email(email: str, name: str, plan: str, amount: float, payment_id: str):
    try:
        # Configuración del email
        message = MIMEMultipart()
        message["From"] = os.getenv("EMAIL_FROM")
        message["To"] = email
        message["Subject"] = "Confirmación de pago MilenzoPet"

        # Cuerpo del email
        html = f"""
        <html>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f7; margin:0; padding:0;">
                <div style="max-width: 480px; margin: 30px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(46,204,64,0.10); overflow: hidden;">
                <div style="background: #2ecc40; color: #fff; padding: 24px 0; text-align: center;">
                    <h1 style="margin:0; font-size: 2em;">¡Pago Exitoso!</h1>
                </div>
                <div style="padding: 28px 32px;">
                    <p style="font-size: 1.1em;">Hola <b>{name}</b>,</p>
                    <p>¡Gracias por tu pago! Aquí tienes los detalles de tu transacción:</p>
                    <table style="width:100%; margin: 18px 0 24px 0; border-collapse:collapse;">
                    <tr>
                        <td style="padding: 8px 0; color:#555;">Plan:</td>
                        <td style="padding: 8px 0; color:#222;"><b>{plan.capitalize()}</b></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color:#555;">Precio:</td>
                        <td style="padding: 8px 0; color:#222;"><b>${amount:,.0f} COP</b></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color:#555;">ID de pago:</td>
                        <td style="padding: 8px 0; color:#222;"><b>{payment_id}</b></td>
                    </tr>
                    </table>
                    <p style="font-size: 1em; color:#555;">Si tienes alguna duda, contáctanos.<br>¡Gracias por confiar en MilenzoPet!</p>
                </div>
                <div style="background: #f0f0f0; color: #888; text-align: center; padding: 12px 0; font-size: 0.95em;">
                    © 2025 MilenzoPet
                </div>
                </div>
            </body>
            </html>
        """

        message.attach(MIMEText(html, "html"))

        # Enviar email
        with smtplib.SMTP(os.getenv("EMAIL_HOST"), int(os.getenv("EMAIL_PORT"))) as server:
            server.starttls()
            server.login(os.getenv("EMAIL_HOST_USER"), os.getenv("EMAIL_HOST_PASSWORD"))
            server.send_message(message)

    except Exception as e:
        print(f"Error enviando email: {str(e)}")