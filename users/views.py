from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Institution
from .serializers import (
    UserSerializer, RegisterSerializer,
    InstitutionSerializer, ChangePasswordSerializer,
    MyTokenObtainPairSerializer
)
from audit.utils import log_action


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Anyone can register"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """Blacklist the refresh token — user is logged out"""
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update your own profile"""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Wrong old password'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'})


# ── Institution Views ────────────────────────────────────────────────

class InstitutionListCreateView(generics.ListCreateAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.AllowAny] # Allow register page to fetch institutions

    def get_queryset(self):
        # Superuser sees all, others see only their own
        if self.request.user.is_authenticated:
            if self.request.user.is_superuser:
                return Institution.objects.all()
            return Institution.objects.filter(id=self.request.user.institution_id)
        return Institution.objects.filter(is_active=True)

    def perform_create(self, serializer):
        institution = serializer.save()
        if self.request.user.is_authenticated:
            log_action(self.request.user, 'CREATE', 'Institution', institution.id, {})


class InstitutionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InstitutionSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Institution.objects.all()
        return Institution.objects.filter(id=self.request.user.institution_id)


class InstitutionUsersView(generics.ListAPIView):
    """Admin sees all users in their institution"""
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(institution=self.request.user.institution)


class ApproveUserView(APIView):
    """Admin toggles approval for a user in their institution"""
    def post(self, request, pk):
        try:
            user_to_update = User.objects.get(pk=pk, institution=request.user.institution)
            user_to_update.is_approved = not user_to_update.is_approved
            user_to_update.save()
            
            action = 'APPROVED' if user_to_update.is_approved else 'REVOKED'
            log_action(request.user, 'UPDATE', 'User', user_to_update.id, {'is_approved': user_to_update.is_approved})
            
            return Response({
                'message': f'User {user_to_update.username} {action.lower()} successfully',
                'is_approved': user_to_update.is_approved
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Users can view and update their own profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
