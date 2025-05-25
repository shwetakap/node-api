pipeline {
    agent any

    environment {
        IMAGE_NAME = 'node-api-app:latest'
        SONAR_PROJECT_KEY = 'shwetakap_node-api'
        SONAR_HOST_URL = 'https://sonarcloud.io'
        SONAR_ORGANIZATION = 'shwetakap'
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout Source Code (Git)') {
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

        stage('Run Unit Tests (Mocha + Chai)') {
            steps {
                script {
                    echo '🔍 Running Unit Tests'
                    bat "docker run --rm ${IMAGE_NAME} npx mocha \"test/unit/**/*.test.js\" --reporter mocha-junit-reporter --reporter-options mochaFile=test-results/unit-test-results.xml"
                }
                junit 'test-results/unit-test-results.xml'
            }
        }

        stage('Run Integration Tests') {
            steps {
                script {
                    echo '🔗 Running Integration Tests'
                    bat "docker run --rm ${IMAGE_NAME} npx mocha \"test/integration/**/*.test.js\" --reporter mocha-junit-reporter --reporter-options mochaFile=test-results/integration-test-results.xml"
                }
                junit 'test-results/integration-test-results.xml'
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
