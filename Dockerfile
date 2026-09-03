FROM node:22-slim AS frontend-build
WORKDIR /frontend
COPY src/homeconnect_ws_sim/frontend/package.json src/homeconnect_ws_sim/frontend/package-lock.json ./
RUN npm ci
COPY src/homeconnect_ws_sim/frontend/ ./
RUN npm run build

FROM python:3.13-slim
WORKDIR /app
COPY . .
COPY --from=frontend-build /frontend/dist src/homeconnect_ws_sim/frontend/dist
RUN pip install --no-cache-dir .

EXPOSE 443 8080
ENTRYPOINT ["python", "-m", "homeconnect_ws_sim"]
CMD ["-f", "/data/appliance.json", "-p", "8080"]
