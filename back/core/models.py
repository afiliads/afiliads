from django.db import models


class Member(models.Model):
    name    = models.CharField(max_length=100)  # Nome
    surname = models.CharField(max_length=100)  # Sobrenome
    phone   = models.CharField(max_length=100)  # Telefone
    email   = models.EmailField()               # E-mail  
    address = models.CharField(max_length=200)  # Endereço
    photo   = models.ImageField(upload_to='members_profile')   # Foto

    def __str__(self):    
     return self.name + " " + self.surname
