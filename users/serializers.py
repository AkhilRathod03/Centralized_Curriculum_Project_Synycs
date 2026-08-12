from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Institution


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Admins are auto-approved or bypass the check
        if self.user.role != 'admin' and not self.user.is_approved:
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
            'phone', 'profile_picture', 'is_verified', 'is_approved',
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

    def validate(self, data):
        role = data.get('role')
        institution = data.get('institution')
        
        # Check if an admin already exists for this institution
        if role == 'admin' and institution:
            if User.objects.filter(institution=institution, role='admin').exists():
                raise serializers.ValidationError({
                    "role": "This institution already has an administrator. Only one admin is allowed per college."
                })
        return data

    def create(self, validated_data):
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')
        
        # Extract role to check for auto-approval
        role = validated_data.get('role')
        
        # Create the user
        user = User.objects.create_user(**validated_data)
        
        # Auto-approve admins
        if role == 'admin':
            user.is_approved = True
            user.save()
            
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
