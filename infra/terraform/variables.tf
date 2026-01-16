variable "aws_region" {
  type        = string
  description = "AWS region to deploy to."
  default     = "ap-northeast-2"
}

variable "profile" {
  type        = string
  description = "Deployment profile (environment)."
  validation {
    condition     = contains(["staging", "prod"], var.profile)
    error_message = "profile must be one of: staging, prod"
  }
}

variable "project_name" {
  type        = string
  description = "Base name for resources (ECR repository, Lambda function, etc.)."
}

variable "image_uri" {
  type        = string
  description = "Fully qualified ECR image URI (recommend using digest), e.g. 123.dkr.ecr.region.amazonaws.com/repo@sha256:..."
}

variable "lambda_architecture" {
  type        = string
  description = "Lambda architecture for container image."
  default     = "arm64"
  validation {
    condition     = contains(["arm64", "x86_64"], var.lambda_architecture)
    error_message = "lambda_architecture must be one of: arm64, x86_64"
  }
}

variable "lambda_memory_size" {
  type        = number
  description = "Lambda memory size (MB)."
  default     = 1024
}

variable "lambda_timeout_seconds" {
  type        = number
  description = "Lambda timeout (seconds)."
  default     = 30
}

variable "ecr_keep_last" {
  type        = number
  description = "How many recent images to keep in ECR via lifecycle policy."
  default     = 20
}

