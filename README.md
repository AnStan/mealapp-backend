# Backend Setup Documentation

This document provides an overview of the backend setup process for our project. It serves as a reference for the infrastructure configuration, deployment, and related best practices to help future developers maintain and extend the system.

---

## **Infrastructure Overview**

The backend infrastructure includes the following AWS services:

- **Amazon RDS**: For managing a SQL-based database.
- **AWS ECS (Fargate)**: For running the backend application as a containerized service.
- **Amazon ECR**: For storing Docker images.
- **AWS CodePipeline and CodeBuild**: For continuous integration and deployment (CI/CD).
- **AWS CloudFormation**: For infrastructure automation using templates.
- **AWS CloudWatch**: For monitoring logs and application performance.

---

## **Database Configuration**

- **Database Engine**: MySQL (Postgres).
- **Instance Type**: Free-tier compatible.
- **Networking**: Configured with a private subnet and public access enabled temporarily for testing.
- **Credentials**: Stored securely using AWS Secrets Manager.

**Key Details:**
- The database is created in the `eu-north-1` region.
- A dedicated security group is used to manage access.

---

## **Backend Containerization**

The backend application is packaged as a Docker container. The following files are part of the container configuration:

### **Dockerfile**
Defines the container environment for the application.

### **package.json**
Lists application dependencies and scripts.

### **index.js**
API endpoints

---

## **Deployment Workflow**

The deployment workflow includes a CI/CD pipeline using AWS CodePipeline and CodeBuild, which automates the build, test, and deploy processes.

### **Pipeline Components**
- **Source**: GitHub (OAuth connected).
- **Build**: Docker image creation and push to Amazon ECR.
- **Deploy**: ECS Fargate task updates using the `imagedefinitions.json` file.

### **Pipeline Configuration**
- `buildspec.yml` is used for the build stage:

```yaml
version: 0.2
phases:
  build:
    commands:
      - echo Building Docker image...
      - docker build -t mealapp-backend .
      - docker tag mealapp-backend:latest <ECR_URI>:latest
      - docker push <ECR_URI>:latest
artifacts:
  files:
    - imagedefinitions.json
```

---

## **ECS Fargate Service**

### **Cluster Configuration**
- **Cluster Name**: `mealapp-cluster`
- **Service Type**: Fargate with auto-assign public IP enabled.

### **Task Definition**
- **Container Name**: `mealapp-container`
- **Image**: `<ECR_URI>:latest`
- **Port Mappings**: 3000 (or application-specific port).
- **CPU**: 256 vCPU.
- **Memory**: 512 MB.

---

## **Testing and Monitoring**

### **Testing the API**
1. Retrieve the public IP of the running ECS task from the ECS console.
2. Use Postman or `curl` to send test requests to the API.
3. Verify responses and troubleshoot as necessary.

### **Logs**
- Use **CloudWatch Logs** to monitor application output and debug issues.
- ECS task logs are available under `/ecs/<task-definition-name>`.

---

## **Security and Best Practices**

- **IAM Roles**: Use least privilege for all roles.
- **Secrets Management**: Store sensitive data (e.g., database credentials) in AWS Secrets Manager.
- **Network Security**: Restrict security group access to trusted IP ranges.
- **Domain and Load Balancer** (Future): Use Route 53 and an Application Load Balancer for production stability and scalability.

---

## **Future Enhancements**
- Migrate from public IP to an ALB for production.
- Integrate authentication mechanisms (e.g., API keys, JWT).
- Add automated tests to the CI/CD pipeline.
- Optimize infrastructure for cost and performance.

---
This documentation serves as a reference for maintaining and scaling the backend infrastructure. Ensure updates are reflected here as the project evolves.

