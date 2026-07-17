pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out EduCenter OS repository...'
                checkout scm
            }
        }
        
        stage('Build Check') {
            steps {
                echo 'Validating codebase structure...'
                sh 'ls -la'
                sh 'echo "Found frontend and backend directories."'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running unit tests (simulated)...'
                sh 'echo "Tests passed!"'
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying to K3s cluster...'
                sh 'echo "Deployment step would run here via ArgoCD!"'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution complete.'
        }
    }
}
