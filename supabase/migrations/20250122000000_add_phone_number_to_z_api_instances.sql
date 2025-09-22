-- Adicionar campo phone_number à tabela z_api_instances
ALTER TABLE z_api_instances 
ADD COLUMN phone_number TEXT;

-- Atualizar o registro existente com o número correto do Z-API
UPDATE z_api_instances 
SET phone_number = '554598228660' 
WHERE instance_id = '3E6044FF2AD36009F1136EDA9E2AF219';

-- Adicionar comentário explicativo
COMMENT ON COLUMN z_api_instances.phone_number IS 'Número de telefone real da instância Z-API';
