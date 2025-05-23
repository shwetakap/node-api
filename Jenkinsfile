pipeline {
    agent any

    environment {
        IMAGE_NAME = 'node-api-app:latest'
        SONAR_PROJECT_KEY = 'shwetakap_node-api'
        SONAR_HOST_URL = 'https://sonarcloud.io'
        SONAR_ORGANIZATION = 'shwetakap'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/shwetakap/node-api.git'
            }
        }

        stage('Build using Docker') {
            steps {
                script {
                    bat "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Test by Mocha') {
            steps {
                script {
                    bat 'npm install'
                    bat 'npx mocha --reporter mocha-junit-reporter --reporter-options mochaFile=test-results.xml'
                }
                junit 'test-results.xml'
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
                        echo "🔗 SonarCloud Dashboard: https://sonarcloud.io/dashboard?id=${SONAR_PROJECT_KEY}"
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

        stage('Deploy to Staging') {
            steps {
                script {
                    echo '🔧 Deploying to staging...'
                    bat 'docker-compose -f docker-compose.staging.yml up -d --build'
                }
            }
        }

        stage('Release to Production using DockerCompose') {
            steps {
                input message: 'Promote to production?'
                script {
                    echo '🚀 Deploying to production...'
                    bat 'docker-compose -f docker-compose.prod.yml up -d --build'
                }
            }
        }
    }
}
