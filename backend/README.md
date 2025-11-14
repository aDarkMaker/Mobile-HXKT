# Local Backend

    - 本地模拟后端程序
    - 实际运行需要额外部署
    - 同时替换已有的端口号

## 框架

- FastApi
    - 实现功能
        - B站动态动态获取与发送
        - 数据库服务
        - 网盘挂载
        - 任务列表转发与同步
        - ……
- MySQL
    - 架构
        - Name
            - Avatar
            - Nickname
            - QQ_id
            - Settings
        - Background
        - Tasks
        - ……

## How to Run?

```bash
uvicorn main:app --reload
```
