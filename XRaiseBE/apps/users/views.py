from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.users.serializers import JWTSerializer, RegisterSerializer, UserStatsSerializer

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "registered"}, status=status.HTTP_201_CREATED)


class UserStatsView(APIView):
    def get(self, request):
        serializer = UserStatsSerializer(request.user)
        return Response(serializer.data)


class JWTLoginView(TokenObtainPairView):
    serializer_class = JWTSerializer

