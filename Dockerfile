# Set up the base image
FROM public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 AS aws-lambda-adapter
FROM denoland/deno:bin-2.6.5 AS deno_bin
FROM debian:bookworm-20260112-slim AS deno_runtime
COPY --from=aws-lambda-adapter /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=deno_bin /deno /usr/local/bin/deno

# to let aws lambda adapter know the port
ENV PORT=8080
EXPOSE ${PORT}

# Lambda container runtime filesystem is read-only except /tmp
ENV DENO_DIR=/tmp/deno_dir

# Copy the function code
WORKDIR "/var/task"
COPY . /var/task

RUN chmod +x /var/task/infra/lambda-entrypoint.sh

RUN DENO_DIR=/var/deno_dir_seed deno cache app/index.ts

# Warm up native deps (e.g. @felix/bcrypt downloads a platform-specific .so at runtime).
# Trigger the download during build so it ends up in /var/deno_dir_seed and can be copied into /tmp at runtime.
RUN DENO_DIR=/var/deno_dir_seed deno eval -q "import * as bcrypt from '@felix/bcrypt'; await bcrypt.hash('warmup');"

# At runtime, copy the seed cache to the writable DENO_DIR location.
# Then run the app with a timeout of 10s to detect any runtime downloads.
RUN DENO_DIR=/var/deno_dir_seed \
  PROFILE=local \
  DB_PRIMARY_URL=mysql://mysql:mysql@localhost:3306/public \
  DB_REPLICA_URL=mysql://mysql:mysql@localhost:3306/public \
  DB_PRIMARY_URL_LOCAL=mysql://mysql:mysql@localhost:3306/public \
  AUTH_SECRET=b3631ecd8d00b160fd2d00fb914cbec3bc4dfe9fd2f821fa3bb61df1c2650636 \
  USE_MOCK_ADAPTER=true \
  timeout 10s deno run -A app/index.ts --port=${PORT} || [ $? -eq 124 ] || exit 1

CMD ["/var/task/infra/lambda-entrypoint.sh"]