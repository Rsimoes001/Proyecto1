# infra/versions.tf

terraform {
  required_providers {
    # Usamos el proveedor Docker para gestionar recursos locales (contenedores)
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.7"
    }
  }
}

# Configuración del proveedor Docker (usa la conexión local por defecto)
provider "docker" {}
