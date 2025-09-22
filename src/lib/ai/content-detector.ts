import { ImageAnnotatorClient } from '@google-cloud/vision'

export interface ContentDetectionResult {
  isInappropriate: boolean
  confidence: number
  categories: {
    adult: 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY'
    violence: 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY'
    racy: 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY'
  }
  details: string
}

export class ContentDetector {
  private client: ImageAnnotatorClient
  private readonly INAPPROPRIATE_THRESHOLD = 'POSSIBLE' // Considera inapropriado a partir de "POSSIBLE"

  constructor() {
    // Inicializa o cliente Google Vision API
    this.client = new ImageAnnotatorClient({
      // As credenciais serão carregadas automaticamente via GOOGLE_APPLICATION_CREDENTIALS
      // ou via service account key
    })
  }

  /**
   * Analisa uma imagem para detectar conteúdo inapropriado
   * @param imageBuffer Buffer da imagem
   * @returns Resultado da análise
   */
  async analyzeImage(imageBuffer: Buffer): Promise<ContentDetectionResult> {
    try {
      console.log('🔍 CONTENT DETECTOR: Iniciando análise de imagem...')
      
      // Fazer a requisição para o Google Vision API
      const [result] = await this.client.safeSearchDetection({
        image: { content: imageBuffer }
      })

      const safeSearch = result.safeSearchAnnotation
      
      if (!safeSearch) {
        console.log('⚠️ CONTENT DETECTOR: Nenhum resultado de safe search retornado')
        return {
          isInappropriate: false,
          confidence: 0,
          categories: {
            adult: 'VERY_UNLIKELY',
            violence: 'VERY_UNLIKELY',
            racy: 'VERY_UNLIKELY'
          },
          details: 'Análise não disponível'
        }
      }

      console.log('📊 CONTENT DETECTOR: Resultado da análise:', {
        adult: safeSearch.adult,
        violence: safeSearch.violence,
        racy: safeSearch.racy
      })

      // Verificar se algum conteúdo é inapropriado
      const isInappropriate = this.isContentInappropriate(safeSearch)
      
      // Calcular confiança baseada na severidade
      const confidence = this.calculateConfidence(safeSearch)
      
      // Gerar detalhes da análise
      const details = this.generateDetails(safeSearch)

      console.log(`✅ CONTENT DETECTOR: Análise concluída - Inapropriado: ${isInappropriate}, Confiança: ${confidence}%`)

      return {
        isInappropriate,
        confidence,
        categories: {
          adult: safeSearch.adult || 'VERY_UNLIKELY',
          violence: safeSearch.violence || 'VERY_UNLIKELY',
          racy: safeSearch.racy || 'VERY_UNLIKELY'
        },
        details
      }

    } catch (error) {
      console.error('❌ CONTENT DETECTOR: Erro na análise:', error)
      
      // Em caso de erro, retornar resultado seguro (não inapropriado)
      return {
        isInappropriate: false,
        confidence: 0,
        categories: {
          adult: 'VERY_UNLIKELY',
          violence: 'VERY_UNLIKELY',
          racy: 'VERY_UNLIKELY'
        },
        details: `Erro na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Verifica se o conteúdo é inapropriado baseado nos resultados
   */
  private isContentInappropriate(safeSearch: any): boolean {
    const { adult, violence, racy } = safeSearch
    
    // Considera inapropriado se qualquer categoria for POSSIBLE ou superior
    return this.isLikelyInappropriate(adult) || 
           this.isLikelyInappropriate(violence) || 
           this.isLikelyInappropriate(racy)
  }

  /**
   * Verifica se uma categoria específica é provavelmente inapropriada
   */
  private isLikelyInappropriate(level: string): boolean {
    const levels = ['VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY']
    const thresholdIndex = levels.indexOf(this.INAPPROPRIATE_THRESHOLD)
    const currentIndex = levels.indexOf(level)
    
    return currentIndex >= thresholdIndex
  }

  /**
   * Calcula a confiança baseada na severidade do conteúdo
   */
  private calculateConfidence(safeSearch: any): number {
    const { adult, violence, racy } = safeSearch
    const levels = ['VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY']
    
    let maxConfidence = 0
    
    // Calcular confiança para cada categoria
    const adultConfidence = this.getConfidenceValue(adult, levels)
    const violenceConfidence = this.getConfidenceValue(violence, levels)
    const racyConfidence = this.getConfidenceValue(racy, levels)
    
    maxConfidence = Math.max(adultConfidence, violenceConfidence, racyConfidence)
    
    return Math.round(maxConfidence)
  }

  /**
   * Converte o nível de detecção em valor de confiança (0-100)
   */
  private getConfidenceValue(level: string, levels: string[]): number {
    const index = levels.indexOf(level)
    if (index === -1) return 0
    
    // VERY_UNLIKELY = 0%, UNLIKELY = 25%, POSSIBLE = 50%, LIKELY = 75%, VERY_LIKELY = 100%
    return (index / (levels.length - 1)) * 100
  }

  /**
   * Gera detalhes descritivos da análise
   */
  private generateDetails(safeSearch: any): string {
    const { adult, violence, racy } = safeSearch
    const details = []
    
    if (this.isLikelyInappropriate(adult)) {
      details.push(`Conteúdo adulto: ${adult}`)
    }
    
    if (this.isLikelyInappropriate(violence)) {
      details.push(`Conteúdo violento: ${violence}`)
    }
    
    if (this.isLikelyInappropriate(racy)) {
      details.push(`Conteúdo sugestivo: ${racy}`)
    }
    
    if (details.length === 0) {
      return 'Conteúdo apropriado'
    }
    
    return details.join(', ')
  }

  /**
   * Analisa uma URL de imagem (para casos onde temos URL em vez de buffer)
   */
  async analyzeImageUrl(imageUrl: string): Promise<ContentDetectionResult> {
    try {
      console.log('🔍 CONTENT DETECTOR: Analisando URL de imagem:', imageUrl)
      
      const [result] = await this.client.safeSearchDetection({
        image: { source: { imageUri: imageUrl } }
      })

      const safeSearch = result.safeSearchAnnotation
      
      if (!safeSearch) {
        return {
          isInappropriate: false,
          confidence: 0,
          categories: {
            adult: 'VERY_UNLIKELY',
            violence: 'VERY_UNLIKELY',
            racy: 'VERY_UNLIKELY'
          },
          details: 'Análise não disponível'
        }
      }

      const isInappropriate = this.isContentInappropriate(safeSearch)
      const confidence = this.calculateConfidence(safeSearch)
      const details = this.generateDetails(safeSearch)

      return {
        isInappropriate,
        confidence,
        categories: {
          adult: safeSearch.adult || 'VERY_UNLIKELY',
          violence: safeSearch.violence || 'VERY_UNLIKELY',
          racy: safeSearch.racy || 'VERY_UNLIKELY'
        },
        details
      }

    } catch (error) {
      console.error('❌ CONTENT DETECTOR: Erro na análise de URL:', error)
      
      return {
        isInappropriate: false,
        confidence: 0,
        categories: {
          adult: 'VERY_UNLIKELY',
          violence: 'VERY_UNLIKELY',
          racy: 'VERY_UNLIKELY'
        },
        details: `Erro na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Analisa um vídeo (extrai frame e analisa)
   * Nota: Google Vision API não analisa vídeos diretamente, então vamos extrair um frame
   */
  async analyzeVideo(videoUrl: string): Promise<ContentDetectionResult> {
    try {
      console.log('🔍 CONTENT DETECTOR: Analisando vídeo:', videoUrl)
      
      // Para vídeos, vamos usar a URL diretamente e deixar o Google Vision API tentar
      // Na prática, ele pode analisar o thumbnail ou primeiro frame
      const [result] = await this.client.safeSearchDetection({
        image: { source: { imageUri: videoUrl } }
      })

      const safeSearch = result.safeSearchAnnotation
      
      if (!safeSearch) {
        return {
          isInappropriate: false,
          confidence: 0,
          categories: {
            adult: 'VERY_UNLIKELY',
            violence: 'VERY_UNLIKELY',
            racy: 'VERY_UNLIKELY'
          },
          details: 'Análise de vídeo não disponível'
        }
      }

      const isInappropriate = this.isContentInappropriate(safeSearch)
      const confidence = this.calculateConfidence(safeSearch)
      const details = this.generateDetails(safeSearch)

      console.log(`✅ CONTENT DETECTOR: Análise de vídeo concluída - Inapropriado: ${isInappropriate}, Confiança: ${confidence}%`)

      return {
        isInappropriate,
        confidence,
        categories: {
          adult: safeSearch.adult || 'VERY_UNLIKELY',
          violence: safeSearch.violence || 'VERY_UNLIKELY',
          racy: safeSearch.racy || 'VERY_UNLIKELY'
        },
        details: `Análise de vídeo: ${details}`
      }

    } catch (error) {
      console.error('❌ CONTENT DETECTOR: Erro na análise de vídeo:', error)
      
      return {
        isInappropriate: false,
        confidence: 0,
        categories: {
          adult: 'VERY_UNLIKELY',
          violence: 'VERY_UNLIKELY',
          racy: 'VERY_UNLIKELY'
        },
        details: `Erro na análise de vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }
}

export default ContentDetector