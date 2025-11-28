pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "srinivas30297"   // your username
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/tutorconnect-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/tutorconnect-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build backend image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        def backendImage = docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}", "backend")
                        backendImage.push()
                        backendImage.push("latest")
                    }
                }
            }
        }

        stage('Build frontend image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        def frontendImage = docker.build("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}", "frontend")
                        frontendImage.push()
                        frontendImage.push("latest")
                    }
                }
            }
        }
    }
}
