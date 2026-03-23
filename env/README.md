# Variables de Entorno

## Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/studiapp

# Entorno de ejecución
NODE_ENV=development
```

## Formato de DATABASE_URL

```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_base_de_datos]
```

### Ejemplos

**Local:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/studiapp
```

**Remoto:**
```
DATABASE_URL=postgresql://user:pass@db.example.com:5432/studiapp
```

**Con SSL (producción):**
```
DATABASE_URL=postgresql://user:pass@db.example.com:5432/studiapp?sslmode=require
```

## Variables Futuras

Cuando se implemente autenticación, agregar:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-super-segura-aqui
```
