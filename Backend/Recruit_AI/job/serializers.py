from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
        

class JobOpeningSerializer(serializers.ModelSerializer):
    # resumes = ResumeSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    created_at = serializers.SerializerMethodField()
    
    class Meta:
        model = JobOpening
        fields = ('id', 'title', 'role_type', 'domain', 'level_of_position', 'candidates_required', 'created_at', 'user', 'is_active', 'location' ,'onsite' , 'salary', 'pointer')

    def get_created_at(self, obj):
        if obj.created_at:
            return obj.created_at.strftime("%d %b %Y, %I:%M %p")

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    company = serializers.CharField(write_only=True)

    # company_name = serializers.SerializerMethodField(read_only =True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'company')
        extra_kwargs = {'password': {'write_only': True}}
    
    def get_company_name(self, obj):
        # Handles the case when the related model doesn't exist yet
        try:
            return obj.user_extended_fields.company
        except UserExtendedModel.DoesNotExist:
            return "company"
        
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')
        company = validated_data.pop('company')
        
        # create User
        user = User.objects.create_user(password=password,**validated_data)

        # create or update UserExtendedModel
        UserExtendedModel.objects.update_or_create(user=user, defaults={'company': company})
        
        return user