from __future__ import annotations

from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.serializers import UserSerializer


class CurrentUserView(APIView):
    """
    GET /api/accounts/me/
    Returns the currently authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    Clears the auth cookie.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request: Request) -> Response:
        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key=settings.ACCESS_TOKEN_COOKIE,
            path=settings.ACCESS_TOKEN_COOKIE_PATH,
            samesite=settings.ACCESS_TOKEN_COOKIE_SAMESITE,
        )
        response.delete_cookie(
            key=settings.REFRESH_TOKEN_COOKIE,
            path=settings.REFRESH_TOKEN_COOKIE_PATH,
            samesite=settings.REFRESH_TOKEN_COOKIE_SAMESITE,
        )
        response.delete_cookie(
            key="uga_jwt",
            path="/",
            samesite=settings.ACCESS_TOKEN_COOKIE_SAMESITE,
        )
        return response


class UserListView(generics.ListAPIView):
    """
    GET /api/accounts/list/
    List all users (authenticated only).
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
