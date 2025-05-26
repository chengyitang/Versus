# 使用 Python 3.11 slim 版本作為基礎映像
FROM python:3.11-slim AS builder

# 設置工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴文件
COPY requirements.txt .

# 創建虛擬環境並安裝依賴
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# 使用更小的基礎映像作為最終映像
FROM python:3.11-slim

# 複製虛擬環境
COPY --from=builder /opt/venv /opt/venv

# 設置環境變數
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# 設置工作目錄
WORKDIR /app

# 複製應用程式代碼
COPY . .

# 暴露端口（根據您的應用設置）
EXPOSE 8000

# 運行 Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker"]
