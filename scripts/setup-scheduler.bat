@echo off
echo Configurando scheduler de campanhas...

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Erro: Node.js não está instalado ou não está no PATH
    pause
    exit /b 1
)

REM Criar tarefa agendada para executar a cada minuto
echo Criando tarefa agendada...

schtasks /create /tn "CampaignScheduler" /tr "node \"%~dp0scheduler.js\"" /sc minute /mo 1 /f

if errorlevel 1 (
    echo Erro ao criar tarefa agendada
    pause
    exit /b 1
)

echo ✅ Scheduler configurado com sucesso!
echo A tarefa "CampaignScheduler" foi criada e executará a cada minuto
echo Para remover a tarefa, execute: schtasks /delete /tn "CampaignScheduler" /f
pause
