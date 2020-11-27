from django.contrib.auth import models
from rest_framework import serializers
from .models import Member 

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'name', 'surname', 'phone','email','address','photo']


    