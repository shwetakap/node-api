pipeline {
    agent any

    environment {
        IMAGE_NAME = 'node-api-app:latest'
        SONAR_PROJECT_KEY = 'shwetakap_node-api'
        SONAR_HOST_URL = 'https://sonarcloud.io'
        SONAR_ORGANIZATION = 'shwetakap'
        NODE_ENV = 'test'
        MONGO_URL = 'mongodb://host.docker.internal:27017/test-db'
    }

    stages {
        stage('Checkout Source Code (Git)') {
            steps {
                git branch: 'main', url: 'https://github.com/shwetakap/node-api.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build --no-cache -t %IMAGE_NAME% .'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Unit Tests Locally') {
            steps {
                bat 'set MONGO_URL=%MONGO_URL%&& set NODE_ENV=%NODE_ENV%&& npx mocha "test/unit/**/*.test.js" --timeout 10000'
            }
        }

        stage('Run Integration Tests Locally') {
            steps {
                bat 'set MONGO_URL=%MONGO_URL%&& set NODE_ENV=%NODE_ENV%&& npx mocha "test/integration/**/*.test.js" --timeout 10000'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    script {
                        echo '🔍 Running SonarCloud analysis...'
                        bat """
                            set PATH=C:\\SonarScanner\\sonar-scanner-5.0.1.3006-windows\\bin;%PATH%
                            sonar-scanner ^
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} ^
                            -Dsonar.sources=. ^
                            -Dsonar.organization=${SONAR_ORGANIZATION} ^
                            -Dsonar.host.url=${SONAR_HOST_URL} ^
                            -Dsonar.login=%SONAR_TOKEN%
                        """
                    }
                }
            }
        }

        stage('Snyk Security Scan') {
            steps {
                withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
                    script {
                        bat 'npm install -g snyk'
                        bat "snyk auth %SNYK_TOKEN%"
                        def snykStatus = bat(returnStatus: true, script: 'snyk test --json > snyk-report.json')
                        if (snykStatus != 0) {
                            echo '⚠️ Vulnerabilities found. Check snyk-report.json for details.'
                        }
                        archiveArtifacts artifacts: 'snyk-report.json', allowEmptyArchive: true
                    }
                }
            }
        }

        stage('Deploy to Staging (New Relic Test)') {
            steps {
                withCredentials([string(credentialsId: 'NEW_RELIC_LICENSE_KEY', variable: 'NEW_RELIC_LICENSE_KEY')]) {
                    script {
                        echo '🔧 Deploying to staging with New Relic...'
                        bat """
                            set NEW_RELIC_LICENSE_KEY=%NEW_RELIC_LICENSE_KEY%
                            docker-compose -f docker-compose.staging.yml up -d --build
                        """
                    }
                }
            }
        }

        stage('Release to Production using DockerCompose+NewRelic Monitoring') {
            steps {
                input message: 'Promote to production?'
                withCredentials([string(credentialsId: 'NEW_RELIC_LICENSE_KEY', variable: 'NEW_RELIC_LICENSE_KEY')]) {
                    script {
                        echo '🚀 Deploying to production with New Relic...'
                        bat """
                            set NEW_RELIC_LICENSE_KEY=%NEW_RELIC_LICENSE_KEY%
                            docker-compose -f docker-compose.prod.yml up -d --build
                        """
                    }
                }
            }
        }
    }
}
