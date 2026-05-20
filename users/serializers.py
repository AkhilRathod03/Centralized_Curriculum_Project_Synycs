from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Institution


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_approved:
            raise serializers.ValidationError({
                "detail": "Your account is pending admin approval. Please contact your institution's administrator."
            })
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['email'] = user.email
        token['username'] = user.username
        if user.institution:
            token['institution_name'] = user.institution.name
            token['institution_id'] = user.institution.id
        return token


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'code', 'logo', 'address', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class UserSerializer(serializers.ModelSerializer):
    institution_detail = InstitutionSerializer(source='institution', read_only=True)
    program_name = serializers.ReadOnlyField(source='program.name')

    class Meta:
        model = User
        fields = [
            'id', 'unique_id', 'username', 'email', 'first_name', 'last_name',
            'role', 'institution', 'institution_detail',
            'phone', 'profile_picture', 'is_verified',
            'last_login', 'date_joined', 'bio', 'experience', 
            'year_of_study', 'program', 'program_name'
        ]
        read_only_fields = ['unique_id', 'is_verified', 'last_login', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'role', 'institution', 'phone'
        ]
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': True}
        }

    def create(self, validated_data):
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')
        user = User.objects.create_user(**validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
