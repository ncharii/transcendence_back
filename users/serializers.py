# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, UserStats


class UserProfileSerializer(serializers.ModelSerializer):

    following = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all())
    followers = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'email', 'username', 'password', 'avatar', 'following', 'followers')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = UserProfile.objects.create_user(**validated_data)
        return user
        
class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = ['user', 'wins', 'losses', 'games_played']