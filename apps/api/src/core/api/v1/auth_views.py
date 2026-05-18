from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        first_name = data.get('name') or data.get('first_name')
        email = data.get('email')
        password = data.get('password')

        if not email or not password or not first_name:
            return Response({"error": "Todos los campos son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            return Response({"error": "El correo electrónico ya está en uso"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "message": "Usuario creado correctamente",
            "token": token.key,
            "user": {
                "id": user.id,
                "name": user.first_name,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return Response({"error": "Correo y contraseña son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=email, password=password)

        if not user:
            return Response({"error": "Credenciales incorrectas"}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "name": user.first_name,
                "email": user.email
            }
        }, status=status.HTTP_200_OK)

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        credential = data.get('credential')
        
        if credential:
            import requests
            import os
            from django.conf import settings
            try:
                # Verify and decode Google JWT token securely using Google's tokeninfo API
                response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}", timeout=5)
                if response.status_code == 200:
                    payload = response.json()
                    
                    # Strict audience validation
                    google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None) or os.environ.get('GOOGLE_CLIENT_ID')
                    if google_client_id and payload.get('aud') != google_client_id:
                        return Response({"error": "Token de Google no emitido para esta aplicación"}, status=status.HTTP_400_BAD_REQUEST)

                    email = payload.get('email')
                    name = payload.get('name') or payload.get('given_name') or email.split('@')[0]
                    if not email:
                        return Response({"error": "No se pudo obtener el correo de Google"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Token de Google inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": f"Error al verificar token con Google: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            email = data.get('email')
            name = data.get('name')
            if not email or not name:
                return Response({"error": "Token de Google o (correo y nombre) son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first() or User.objects.filter(username=email).first()
        
        if not user:
            from django.utils.crypto import get_random_string
            random_password = get_random_string(32)
            user = User.objects.create_user(
                username=email,
                email=email,
                password=random_password,
                first_name=name
            )
            status_code = status.HTTP_201_CREATED
        else:
            status_code = status.HTTP_200_OK

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "name": user.first_name,
                "email": user.email
            }
        }, status=status_code)

