# infra/versions.tf

terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      # Usaremos >= 3.6.0 (mayor o igual a 3.6.0)
      version = "~> 3.6"
    }
  }
}

# Configuración del proveedor Docker (usa la conexión local por defecto)
provider "docker" {}
