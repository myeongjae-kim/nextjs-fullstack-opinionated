output "ecr_repository_url" {
  description = "ECR repository URL (push images here)."
  value       = aws_ecr_repository.this.repository_url
}

output "profile" {
  description = "Deployment profile for this stack."
  value       = var.profile
}

output "ecr_repository_arn" {
  description = "ECR repository ARN."
  value       = aws_ecr_repository.this.arn
}

output "lambda_function_name" {
  description = "Lambda function name."
  value       = aws_lambda_function.this.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN."
  value       = aws_lambda_function.this.arn
}

output "lambda_function_url" {
  description = "Public Lambda Function URL (auth NONE)."
  value       = aws_lambda_function_url.this.function_url
}

