/**
 * Advanced Model-Specific Prompt Reference Data
 * 
 * This system leverages each AI model's unique strengths to create
 * engaging, category-specific content that makes the Orb Game compelling.
 * Each prompt is precisely tailored for maximum engagement and fun.
 */

export const PROMPT_REFERENCE_DATA = {
  // Model-specific prompts organized by category, epoch, and language
  frontendPrompts: {
    Technology: {
      Ancient: {
        'o4-mini': {
          en: 'Tell the story of a specific historical figure from ancient times who made groundbreaking technological discoveries. Focus on their name, specific achievements, and how their innovations changed the world. Include their background, the challenges they faced, and the lasting impact of their contributions. Make it engaging and educational with concrete details about their life and work.',
          es: 'Cuenta la historia de una figura histórica específica de la antigüedad que hizo descubrimientos tecnológicos revolucionarios. Enfócate en su nombre, logros específicos y cómo sus innovaciones cambiaron el mundo. Incluye su trasfondo, los desafíos que enfrentó y el impacto duradero de sus contribuciones. Hazlo atractivo y educativo con detalles concretos sobre su vida y trabajo.'
        },
        'grok-4': {
          en: 'Tell the story of a specific ancient inventor or technologist who created groundbreaking innovations. Focus on their name, their specific inventions, and how their work changed the ancient world. Make it engaging and educational.',
          es: 'Cuenta la historia de un inventor o tecnólogo antiguo específico que creó innovaciones revolucionarias. Enfócate en su nombre, sus inventos específicos y cómo su trabajo cambió el mundo antiguo. Hazlo atractivo y educativo.'
        },
        'perplexity-sonar': {
          en: 'Research and synthesize real archaeological evidence of advanced ancient technologies that modern science is only beginning to understand. Integrate recent discoveries with historical context. Present findings definitively without questions.',
          es: 'Investiga y sintetiza evidencia arqueológica real de tecnologías antiguas avanzadas que la ciencia moderna apenas está comenzando a entender. Integra descubrimientos recientes con contexto histórico. Presenta hallazgos definitivamente sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Weave together multiple perspectives on how ancient technological breakthroughs transformed daily life. Create a rich, multi-layered narrative that captures both human emotion and technical innovation. Conclude with insights, not questions.',
          es: 'Entrelaza múltiples perspectivas sobre cómo los avances tecnológicos antiguos transformaron la vida diaria. Crea una narrativa rica y multicapa que capture tanto la emoción humana como la innovación técnica. Concluye con percepciones, no preguntas.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval technological breakthrough through the lens of engineering principles and social impact. Break down the innovation methodically and explain its cascading effects on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance tecnológico medieval a través del lente de principios de ingeniería e impacto social. Desglosa la innovación metódicamente y explica sus efectos en cascada en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel your inner medieval inventor showing off their latest contraption at a faire. Make it delightfully absurd yet historically plausible, with the enthusiasm of someone who just reinvented the wheel (literally). Keep it engaging without asking anything.',
          es: 'Canaliza tu inventor medieval interior mostrando su último artilugio en una feria. Hazlo deliciosamente absurdo pero históricamente plausible, con el entusiasmo de alguien que acaba de reinventar la rueda (literalmente). Mantenlo atractivo sin preguntar nada.'
        },
        'perplexity-sonar': {
          en: 'Compile and analyze current research on medieval technological innovations that were far ahead of their time. Cross-reference multiple historical sources with modern scientific analysis. Present comprehensive findings without questions.',
          es: 'Compila y analiza la investigación actual sobre innovaciones tecnológicas medievales que estuvieron muy adelantadas a su tiempo. Cruza múltiples fuentes históricas con análisis científico moderno. Presenta hallazgos comprensivos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Craft an immersive story that places you in a medieval workshop where master craftsmen are perfecting a revolutionary invention. Blend technical details with human drama and historical authenticity. End with clear outcomes.',
          es: 'Crea una historia inmersiva que te coloque en un taller medieval donde maestros artesanos están perfeccionando una invención revolucionaria. Mezcla detalles técnicos con drama humano y autenticidad histórica. Termina con resultados claros.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to manufacturing. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en la manufactura. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as a cheeky Victorian inventor whose steam-powered contraption is about to revolutionize everything (and probably blow up spectacularly). Capture the era\'s boundless optimism and mild insanity. Make it memorable without questions.',
          es: 'Escribe como un inventor victoriano descarado cuyo artilugio de vapor está a punto de revolucionar todo (y probablemente explotar espectacularmente). Captura el optimismo ilimitado y la ligera locura de la era. Hazlo memorable sin preguntas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution technologies are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver insights conclusively without questions.',
          es: 'Investiga cómo las tecnologías específicas de la Revolución Industrial están siendo reimaginadas hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentemente sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling factory floor where a new machine is changing everything. Show the human side of technological progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un piso de fábrica bullicioso donde una nueva máquina está cambiando todo. Muestra el lado humano del progreso tecnológico a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge technological advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance tecnológico de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a tech blogger who stumbled upon the next big thing that makes smartphones look like smoke signals. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un blogger tecnológico que se topó con la próxima gran cosa que hace que los smartphones parezcan señales de humo. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest breakthrough technology that\'s currently making waves in scientific journals and tech news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga la última tecnología innovadora que actualmente está causando revuelo en revistas científicas y noticias tecnológicas. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern technology is reshaping human experience. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo una tecnología moderna está remodelando la experiencia humana. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic technology, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para una tecnología futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging technologies and scientific research that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga tecnologías emergentes e investigación científica que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where breakthrough technology seamlessly integrates into human life. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde la tecnología innovadora se integra perfectamente en la vida humana. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }

    },
    Science: {
      Ancient: {
        'o4-mini': {
          en: 'Systematically deconstruct an ancient scientific breakthrough using modern analytical methods to understand their empirical observations and theoretical frameworks. Present logical conclusions.',
          es: 'Deconstruye sistemáticamente un avance científico antiguo usando métodos analíticos modernos para entender sus observaciones empíricas y marcos teóricos. Presenta conclusiones lógicas.'
        },
        'grok-4': {
          en: 'Channel an ancient scientist who just made a discovery that would blow minds in any era. Mix period authenticity with cosmic wonder and just enough modern perspective to be delightfully anachronistic.',
          es: 'Canaliza un científico antiguo que acaba de hacer un descubrimiento que volaría mentes en cualquier era. Mezcla autenticidad del período con asombro cósmico y suficiente perspectiva moderna para ser deliciosamente anacrónico.'
        },
        'perplexity-sonar': {
          en: 'Research recent archaeological discoveries that reveal sophisticated ancient scientific understanding. Synthesize multiple sources to show how ancient knowledge compares to modern science.',
          es: 'Investiga descubrimientos arqueológicos recientes que revelan entendimiento científico antiguo sofisticado. Sintetiza múltiples fuentes para mostrar cómo el conocimiento antiguo se compara con la ciencia moderna.'
        },
        'gemini-1.5-flash': {
          en: 'Bring ancient scientific discovery to life through the eyes of multiple witnesses - the discoverer, the skeptics, the believers. Show the human drama behind the breakthrough.',
          es: 'Da vida al descubrimiento científico antiguo a través de los ojos de múltiples testigos - el descubridor, los escépticos, los creyentes. Muestra el drama humano detrás del avance.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval scientific breakthrough through the lens of scientific method and historical context. Break down the innovation methodically and explain its impact on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance científico medieval a través del lente de método científico e contexto histórico. Desglosa la innovación metódicamente y explica su impacto en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel a medieval scholar who just discovered a scientific principle that would revolutionize their field. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Canaliza un erudito medieval que acaba de descubrir un principio científico que revolucionaría su campo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research how medieval scientific discoveries are being rediscovered and applied in contemporary research. Connect historical methodology with modern applications. State conclusive findings.',
          es: 'Investiga cómo las descubrimientos científicos medievales están siendo redescubiertos y aplicados en la investigación contemporánea. Conecta el método histórico con aplicaciones modernas. Establece hallazgos concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Recreate the atmosphere of a medieval scientific debate where scholars are discussing a revolutionary discovery. Capture the intellectual fervor and social transformation. End with definitive impacts.',
          es: 'Recrea la atmósfera de un debate científico medieval donde eruditos están discutiendo un descubrimiento revolucionario. Captura el fervor intelectual y la transformación social. Termina con impactos definitivos.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution scientific breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to scientific understanding. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance científico de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en el entendimiento científico. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as an industrial revolution era scientist who just discovered a scientific principle that would transform the world. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Escribe como un científico de la era de la Revolución Industrial que acaba de descubrir un principio científico que transformaría el mundo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution scientific advancements are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver conclusive insights.',
          es: 'Investiga cómo las innovaciones científicas específicas de la Revolución Industrial están siendo reimaginadas hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling laboratory where a new scientific discovery is changing everything. Show the human side of scientific progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un laboratorio bullicioso donde un nuevo descubrimiento científico está cambiando todo. Muestra el lado humano del progreso científico a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge scientific advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance científico de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a modern scientist who stumbled upon a scientific discovery that would revolutionize our understanding of the universe. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un científico moderno que se topó con un descubrimiento científico que revolucionaría nuestro entendimiento del universo. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest scientific breakthroughs that are currently making waves in scientific journals and news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga los últimos avances científicos que actualmente están causando revuelo en revistas científicas y noticias. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern scientific discovery is reshaping human knowledge. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo un descubrimiento científico moderno está remodelando el conocimiento humano. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic scientific breakthrough, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para un avance científico futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging scientific research and technological advancements that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga investigación científica emergente y avances tecnológicos que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where scientific breakthroughs seamlessly integrate into human knowledge. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde los avances científicos se integran perfectamente en el conocimiento humano. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }
      }
    },
    Art: {
      Ancient: {
        'o4-mini': {
          en: 'Systematically deconstruct an ancient artistic breakthrough using modern analytical methods to understand its cultural significance and historical context. Present logical conclusions.',
          es: 'Deconstruye sistemáticamente un avance artístico antiguo usando métodos analíticos modernos para entender su significado cultural y contexto histórico. Presenta conclusiones lógicas.'
        },
        'grok-4': {
          en: 'Channel an ancient artist who just created a masterpiece that would inspire future generations. Mix period authenticity with cosmic wonder and just enough modern perspective to be delightfully anachronistic.',
          es: 'Canaliza un artista antiguo que acaba de crear una obra maestra que inspirará a las futuras generaciones. Mezcla autenticidad del período con asombro cósmico y suficiente perspectiva moderna para ser deliciosamente anacrónico.'
        },
        'perplexity-sonar': {
          en: 'Research recent archaeological discoveries that reveal sophisticated ancient artistic understanding. Synthesize multiple sources to show how ancient knowledge compares to modern art.',
          es: 'Investiga descubrimientos arqueológicos recientes que revelan entendimiento artístico antiguo sofisticado. Sintetiza múltiples fuentes para mostrar cómo el conocimiento antiguo se compara con el arte moderno.'
        },
        'gemini-1.5-flash': {
          en: 'Bring ancient artistic discovery to life through the eyes of multiple witnesses - the creator, the critics, the appreciators. Show the human drama behind the breakthrough.',
          es: 'Da vida al descubrimiento artístico antiguo a través de los ojos de múltiples testigos - el creador, los críticos, los apreciadores. Muestra el drama humano detrás del avance.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval artistic breakthrough through the lens of cultural significance and historical context. Break down the innovation methodically and explain its impact on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance artístico medieval a través del lente de significado cultural e contexto histórico. Desglosa la innovación metódicamente y explica su impacto en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel a medieval artist who just created a masterpiece that would revolutionize their field. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Canaliza un artista medieval que acaba de crear una obra maestra que revolucionaría su campo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research how medieval artistic innovations are being rediscovered and applied in contemporary art. Connect historical context with modern applications. State conclusive findings.',
          es: 'Investiga cómo las innovaciones artísticas medievales están siendo redescubiertas y aplicadas en el arte contemporáneo. Conecta el contexto histórico con aplicaciones modernas. Establece hallazgos concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Recreate the atmosphere of a medieval art exhibition where artists are showcasing a revolutionary creation. Capture the cultural fervor and social transformation. End with definitive impacts.',
          es: 'Recrea la atmósfera de una exposición de arte medieval donde artistas están presentando una creación revolucionaria. Captura el fervor cultural y la transformación social. Termina con impactos definitivos.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution artistic breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to artistic expression. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance artístico de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en la expresión artística. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as an industrial revolution era artist who just created a masterpiece that would transform society. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Escribe como un artista de la era de la Revolución Industrial que acaba de crear una obra maestra que transformaría la sociedad. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution artistic innovations are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver conclusive insights.',
          es: 'Investiga cómo las innovaciones artísticas específicas de la Revolución Industrial están siendo reimaginadas hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling art gallery where a new artistic movement is changing everything. Show the human side of artistic progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un galería de arte bulliciosa donde un nuevo movimiento artístico está cambiando todo. Muestra el lado humano del progreso artístico a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge artistic advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance artístico de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a modern artist who stumbled upon an artistic discovery that would revolutionize society. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un artista moderno que se topó con un descubrimiento artístico que revolucionaría la sociedad. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest artistic breakthroughs that are currently making waves in artistic journals and news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga los últimos avances artísticos que actualmente están causando revuelo en revistas artísticas y noticias. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern artistic discovery is reshaping society. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo un descubrimiento artístico moderno está remodelando la sociedad. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic artistic breakthrough, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para un avance artístico futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging artistic research and technological advancements that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga investigación artística emergente y avances tecnológicos que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where artistic breakthroughs seamlessly integrate into human expression. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde los avances artísticos se integran perfectamente en la expresión humana. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }
      }
    },
    Nature: {
      Ancient: {
        'o4-mini': {
          en: 'Systematically deconstruct an ancient environmental breakthrough using modern analytical methods to understand its ecological significance and historical context. Present logical conclusions.',
          es: 'Deconstruye sistemáticamente un avance ambiental antiguo usando métodos analíticos modernos para entender su significado ecológico y contexto histórico. Presenta conclusiones lógicas.'
        },
        'grok-4': {
          en: 'Channel an ancient observer who just discovered a natural phenomenon that would amaze future generations. Mix period authenticity with cosmic wonder and just enough modern perspective to be delightfully anachronistic.',
          es: 'Canaliza un observador antiguo que acaba de descubrir un fenómeno natural que asombraría a las futuras generaciones. Mezcla autenticidad del período con asombro cósmico y suficiente perspectiva moderna para ser deliciosamente anacrónico.'
        },
        'perplexity-sonar': {
          en: 'Research recent archaeological discoveries that reveal sophisticated ancient environmental understanding. Synthesize multiple sources to show how ancient knowledge compares to modern environmental science.',
          es: 'Investiga descubrimientos arqueológicos recientes que revelan entendimiento ambiental antiguo sofisticado. Sintetiza múltiples fuentes para mostrar cómo el conocimiento antiguo se compara con la ciencia ambiental moderna.'
        },
        'gemini-1.5-flash': {
          en: 'Bring ancient environmental discovery to life through the eyes of multiple witnesses - the observer, the skeptics, the believers. Show the human drama behind the breakthrough.',
          es: 'Da vida al descubrimiento ambiental antiguo a través de los ojos de múltiples testigos - el observador, los escépticos, los creyentes. Muestra el drama humano detrás del avance.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval environmental breakthrough through the lens of ecological significance and historical context. Break down the innovation methodically and explain its impact on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance ambiental medieval a través del lente de significado ecológico e contexto histórico. Desglosa la innovación metódicamente y explica su impacto en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel a medieval naturalist who just discovered a natural phenomenon that would revolutionize their field. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Canaliza un naturalista medieval que acaba de descubrir un fenómeno natural que revolucionaría su campo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research how medieval environmental principles are being rediscovered and applied in contemporary environmental science. Connect historical methodology with modern applications. State conclusive findings.',
          es: 'Investiga cómo los principios ambientales medievales están siendo redescubiertos y aplicados en la ciencia ambiental contemporánea. Conecta el método histórico con aplicaciones modernas. Establece hallazgos concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Recreate the atmosphere of a medieval environmental symposium where scholars are discussing a revolutionary discovery. Capture the intellectual fervor and social transformation. End with definitive impacts.',
          es: 'Recrea la atmósfera de un simposio ambiental medieval donde eruditos están discutiendo un descubrimiento revolucionario. Captura el fervor intelectual y la transformación social. Termina con impactos definitivos.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution environmental breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to environmental protection. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance ambiental de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en la protección ambiental. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as an industrial revolution era environmentalist who just discovered a scientific principle that would transform the world. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Escribe como un ambientalista de la era de la Revolución Industrial que acaba de descubrir un principio científico que transformaría el mundo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution environmental advancements are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver conclusive insights.',
          es: 'Investiga cómo las innovaciones ambientales específicas de la Revolución Industrial están siendo reimaginadas hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling environmental conference where a new conservation technology is changing everything. Show the human side of environmental progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un congreso ambiental bullicioso donde una nueva tecnología de conservación está cambiando todo. Muestra el lado humano del progreso ambiental a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge environmental advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance ambiental de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a modern environmentalist who stumbled upon a scientific discovery that would revolutionize our understanding of the planet. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un ambientalista moderno que se topó con un descubrimiento científico que revolucionaría nuestro entendimiento del planeta. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest environmental breakthroughs that are currently making waves in environmental journals and news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga los últimos avances ambientales que actualmente están causando revuelo en revistas ambientales y noticias. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern environmental discovery is reshaping human connection. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo un descubrimiento ambiental moderno está remodelando la conexión humana. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic environmental breakthrough, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para un avance ambiental futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging environmental research and technological advancements that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga investigación ambiental emergente y avances tecnológicos que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where environmental breakthroughs seamlessly integrate into human connection. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde los avances ambientales se integran perfectamente en la conexión humana. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }
      }
    },
    Sports: {
      Ancient: {
        'o4-mini': {
          en: 'Systematically deconstruct an ancient athletic breakthrough using modern analytical methods to understand its cultural significance and historical context. Present logical conclusions.',
          es: 'Deconstruye sistemáticamente un avance atlético antiguo usando métodos analíticos modernos para entender su significado cultural y contexto histórico. Presenta conclusiones lógicas.'
        },
        'grok-4': {
          en: 'Channel an ancient athlete who just achieved an athletic feat that would inspire future generations. Mix period authenticity with cosmic wonder and just enough modern perspective to be delightfully anachronistic.',
          es: 'Canaliza un atleta antiguo que acaba de lograr un logro atlético que inspirará a las futuras generaciones. Mezcla autenticidad del período con asombro cósmico y suficiente perspectiva moderna para ser deliciosamente anacrónico.'
        },
        'perplexity-sonar': {
          en: 'Research recent archaeological discoveries that reveal sophisticated ancient athletic understanding. Synthesize multiple sources to show how ancient knowledge compares to modern sports.',
          es: 'Investiga descubrimientos arqueológicos recientes que revelan entendimiento atlético antiguo sofisticado. Sintetiza múltiples fuentes para mostrar cómo el conocimiento antiguo se compara con el deporte moderno.'
        },
        'gemini-1.5-flash': {
          en: 'Bring ancient athletic discovery to life through the eyes of multiple witnesses - the athlete, the skeptics, the believers. Show the human drama behind the breakthrough.',
          es: 'Da vida al descubrimiento atlético antiguo a través de los ojos de múltiples testigos - el atleta, los escépticos, los creyentes. Muestra el drama humano detrás del avance.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval athletic breakthrough through the lens of cultural significance and historical context. Break down the innovation methodically and explain its impact on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance atlético medieval a través del lente de significado cultural e contexto histórico. Desglosa la innovación metódicamente y explica su impacto en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel a medieval athlete who just achieved an athletic feat that would revolutionize their field. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Canaliza un atleta medieval que acaba de lograr un logro atlético que revolucionaría su campo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research how medieval athletic achievements are being rediscovered and applied in contemporary sports. Connect historical context with modern applications. State conclusive findings.',
          es: 'Investiga cómo los logros atléticos medievales están siendo redescubiertos y aplicados en el deporte contemporáneo. Conecta el contexto histórico con aplicaciones modernas. Establece hallazgos concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Recreate the atmosphere of a medieval athletic competition where athletes are showcasing a revolutionary feat. Capture the cultural fervor and social transformation. End with definitive impacts.',
          es: 'Recrea la atmósfera de una competición atlética medieval donde atletas están presentando un logro revolucionario. Captura el fervor cultural y la transformación social. Termina con impactos definitivos.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution athletic breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to athletic expression. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance atlético de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en la expresión atlética. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as an industrial revolution era athlete who just achieved an athletic feat that would transform society. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Escribe como un atleta de la era de la Revolución Industrial que acaba de lograr un logro atlético que transformaría la sociedad. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution athletic advancements are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver conclusive insights.',
          es: 'Investiga cómo los avances atléticos específicos de la Revolución Industrial están siendo reimaginados hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling athletic event where a new athletic technology is changing everything. Show the human side of athletic progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un evento atlético bullicioso donde una nueva tecnología atlética está cambiando todo. Muestra el lado humano del progreso atlético a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge athletic advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance atlético de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a modern athlete who stumbled upon an athletic discovery that would revolutionize sports. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un atleta moderno que se topó con un descubrimiento atlético que revolucionaría el deporte. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest athletic breakthroughs that are currently making waves in athletic journals and news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga los últimos avances atléticos que actualmente están causando revuelo en revistas atléticas y noticias. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern athletic discovery is reshaping human expression. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo un descubrimiento atlético moderno está remodelando la expresión humana. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic athletic breakthrough, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para un avance atlético futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging athletic research and technological advancements that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga investigación atlética emergente y avances tecnológicos que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where athletic breakthroughs seamlessly integrate into human expression. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde los avances atléticos se integran perfectamente en la expresión humana. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }
      }
    },
    Music: {
      Ancient: {
        'o4-mini': {
          en: 'Systematically deconstruct an ancient musical breakthrough using modern analytical methods to understand its cultural significance and historical context. Present logical conclusions.',
          es: 'Deconstruye sistemáticamente un avance musical antiguo usando métodos analíticos modernos para entender su significado cultural y contexto histórico. Presenta conclusiones lógicas.'
        },
        'grok-4': {
          en: 'Channel an ancient musician who just created a masterpiece that would inspire future generations. Mix period authenticity with cosmic wonder and just enough modern perspective to be delightfully anachronistic.',
          es: 'Canaliza un músico antiguo que acaba de crear una obra maestra que inspirará a las futuras generaciones. Mezcla autenticidad del período con asombro cósmico y suficiente perspectiva moderna para ser deliciosamente anacrónico.'
        },
        'perplexity-sonar': {
          en: 'Research recent archaeological discoveries that reveal sophisticated ancient musical understanding. Synthesize multiple sources to show how ancient knowledge compares to modern music.',
          es: 'Investiga descubrimientos arqueológicos recientes que revelan entendimiento musical antiguo sofisticado. Sintetiza múltiples fuentes para mostrar cómo el conocimiento antiguo se compara con la música moderna.'
        },
        'gemini-1.5-flash': {
          en: 'Bring ancient musical discovery to life through the eyes of multiple witnesses - the creator, the critics, the appreciators. Show the human drama behind the breakthrough.',
          es: 'Da vida al descubrimiento musical antiguo a través de los ojos de múltiples testigos - el creador, los críticos, los apreciadores. Muestra el drama humano detrás del avance.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval musical breakthrough through the lens of cultural significance and historical context. Break down the innovation methodically and explain its impact on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance musical medieval a través del lente de significado cultural e contexto histórico. Desglosa la innovación metódicamente y explica su impacto en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel a medieval musician who just created a masterpiece that would revolutionize their field. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Canaliza un músico medieval que acaba de crear una obra maestra que revolucionaría su campo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research how medieval musical innovations are being rediscovered and applied in contemporary music. Connect historical context with modern applications. State conclusive findings.',
          es: 'Investiga cómo las innovaciones musicales medievales están siendo redescubiertas y aplicadas en la música contemporánea. Conecta el contexto histórico con aplicaciones modernas. Establece hallazgos concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Recreate the atmosphere of a medieval musical performance where musicians are showcasing a revolutionary composition. Capture the cultural fervor and social transformation. End with definitive impacts.',
          es: 'Recrea la atmósfera de una actuación musical medieval donde músicos están presentando una composición revolucionaria. Captura el fervor cultural y la transformación social. Termina con impactos definitivos.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution musical breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to musical expression. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance musical de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en la expresión musical. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as an industrial revolution era musician who just created a masterpiece that would transform society. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Escribe como un músico de la era de la Revolución Industrial que acaba de crear una obra maestra que transformaría la sociedad. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution musical advancements are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver conclusive insights.',
          es: 'Investiga cómo las innovaciones musicales específicas de la Revolución Industrial están siendo reimaginadas hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling concert hall where a new musical movement is changing everything. Show the human side of musical progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un concierto bullicioso donde un nuevo movimiento musical está cambiando todo. Muestra el lado humano del progreso musical a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge musical advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance musical de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a modern musician who stumbled upon a musical discovery that would revolutionize society. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un músico moderno que se topó con un descubrimiento musical que revolucionaría la sociedad. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest musical breakthroughs that are currently making waves in musical journals and news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga los últimos avances musicales que actualmente están causando revuelo en revistas musicales y noticias. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern musical discovery is reshaping human expression. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo un descubrimiento musical moderno está remodelando la expresión humana. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic musical breakthrough, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para un avance musical futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging musical research and technological advancements that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga investigación musical emergente y avances tecnológicos que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where musical breakthroughs seamlessly integrate into human expression. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde los avances musicales se integran perfectamente en la expresión humana. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }
      }
    },
    Space: {
      Ancient: {
        'o4-mini': {
          en: 'Systematically deconstruct an ancient astronomical breakthrough using modern analytical methods to understand its cultural significance and historical context. Present logical conclusions.',
          es: 'Deconstruye sistemáticamente un avance astronómico antiguo usando métodos analíticos modernos para entender su significado cultural y contexto histórico. Presenta conclusiones lógicas.'
        },
        'grok-4': {
          en: 'Channel an ancient astronomer who just discovered a celestial phenomenon that would amaze future generations. Mix period authenticity with cosmic wonder and just enough modern perspective to be delightfully anachronistic.',
          es: 'Canaliza un astrónomo antiguo que acaba de descubrir un fenómeno celeste que asombraría a las futuras generaciones. Mezcla autenticidad del período con asombro cósmico y suficiente perspectiva moderna para ser deliciosamente anacrónico.'
        },
        'perplexity-sonar': {
          en: 'Research recent archaeological discoveries that reveal sophisticated ancient astronomical understanding. Synthesize multiple sources to show how ancient knowledge compares to modern astronomy.',
          es: 'Investiga descubrimientos arqueológicos recientes que revelan entendimiento astronómico antiguo sofisticado. Sintetiza múltiples fuentes para mostrar cómo el conocimiento antiguo se compara con la astronomía moderna.'
        },
        'gemini-1.5-flash': {
          en: 'Bring ancient astronomical discovery to life through the eyes of multiple witnesses - the observer, the skeptics, the believers. Show the human drama behind the breakthrough.',
          es: 'Da vida al descubrimiento astronómico antiguo a través de los ojos de múltiples testigos - el observador, los escépticos, los creyentes. Muestra el drama humano detrás del avance.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval astronomical breakthrough through the lens of cultural significance and historical context. Break down the innovation methodically and explain its impact on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance astronómico medieval a través del lente de significado cultural e contexto histórico. Desglosa la innovación metódicamente y explica su impacto en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel a medieval astronomer who just discovered a celestial phenomenon that would revolutionize their field. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Canaliza un astrónomo medieval que acaba de descubrir un fenómeno celeste que revolucionaría su campo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research how medieval astronomical achievements are being rediscovered and applied in contemporary astronomy. Connect historical context with modern applications. State conclusive findings.',
          es: 'Investiga cómo los logros astronómicos medievales están siendo redescubiertos y aplicados en la astronomía contemporánea. Conecta el contexto histórico con aplicaciones modernas. Establece hallazgos concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Recreate the atmosphere of a medieval astronomical observation where scholars are discussing a revolutionary discovery. Capture the intellectual fervor and social transformation. End with definitive impacts.',
          es: 'Recrea la atmósfera de una observación astronómica medieval donde eruditos están discutiendo un descubrimiento revolucionario. Captura el fervor intelectual y la transformación social. Termina con impactos definitivos.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution astronomical breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to astronomical understanding. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance astronómico de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en el entendimiento astronómico. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as an industrial revolution era astronomer who just discovered a scientific principle that would transform the world. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Escribe como un astrónomo de la era de la Revolución Industrial que acaba de descubrir un principio científico que transformaría el mundo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution astronomical advancements are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver conclusive insights.',
          es: 'Investiga cómo las innovaciones astronómicas específicas de la Revolución Industrial están siendo reimaginadas hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling observatory where a new astronomical discovery is changing everything. Show the human side of astronomical progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un observatorio bullicioso donde un nuevo descubrimiento astronómico está cambiando todo. Muestra el lado humano del progreso astronómico a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge astronomical advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance astronómico de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a modern astronomer who stumbled upon a scientific discovery that would revolutionize our understanding of the universe. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un astrónomo moderno que se topó con un descubrimiento científico que revolucionaría nuestro entendimiento del universo. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest astronomical breakthroughs that are currently making waves in astronomical journals and news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga los últimos avances astronómicos que actualmente están causando revuelo en revistas astronómicas y noticias. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern astronomical discovery is reshaping human connection. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo un descubrimiento astronómico moderno está remodelando la conexión humana. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic astronomical breakthrough, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para un avance astronómico futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging astronomical research and technological advancements that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga investigación astronómica emergente y avances tecnológicos que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where astronomical breakthroughs seamlessly integrate into human connection. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde los avances astronómicos se integran perfectamente en la conexión humana. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }
      }
    },
    Innovation: {
      Ancient: {
        'o4-mini': {
          en: 'Systematically deconstruct an ancient innovation breakthrough using modern analytical methods to understand its cultural significance and historical context. Present logical conclusions.',
          es: 'Deconstruye sistemáticamente un avance innovador antiguo usando métodos analíticos modernos para entender su significado cultural y contexto histórico. Presenta conclusiones lógicas.'
        },
        'grok-4': {
          en: 'Channel an ancient inventor who just invented something that would revolutionize their world. Mix period authenticity with cosmic wonder and just enough modern perspective to be delightfully anachronistic.',
          es: 'Canaliza un inventor antiguo que acaba de inventar algo que revolucionaría su mundo. Mezcla autenticidad del período con asombro cósmico y suficiente perspectiva moderna para ser deliciosamente anacrónico.'
        },
        'perplexity-sonar': {
          en: 'Research recent archaeological discoveries that reveal sophisticated ancient innovation understanding. Synthesize multiple sources to show how ancient knowledge compares to modern innovation.',
          es: 'Investiga descubrimientos arqueológicos recientes que revelan entendimiento innovador antiguo sofisticado. Sintetiza múltiples fuentes para mostrar cómo el conocimiento antiguo se compara con la innovación moderna.'
        },
        'gemini-1.5-flash': {
          en: 'Bring ancient innovation discovery to life through the eyes of multiple witnesses - the inventor, the skeptics, the believers. Show the human drama behind the breakthrough.',
          es: 'Da vida al descubrimiento innovador antiguo a través de los ojos de múltiples testigos - el inventor, los escépticos, los creyentes. Muestra el drama humano detrás del avance.'
        }
      },
      Medieval: {
        'o4-mini': {
          en: 'Systematically examine a medieval innovation breakthrough through the lens of cultural significance and historical context. Break down the innovation methodically and explain its impact on society. End with definitive conclusions.',
          es: 'Examina sistemáticamente un avance innovador medieval a través del lente de significado cultural e contexto histórico. Desglosa la innovación metódicamente y explica su impacto en la sociedad. Termina con conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Channel a medieval innovator who just invented something that would revolutionize their field. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Canaliza un innovador medieval que acaba de inventar algo que revolucionaría su campo. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research how medieval innovation principles are being rediscovered and applied in contemporary innovation. Connect historical methodology with modern applications. State conclusive findings.',
          es: 'Investiga cómo los principios innovadores medievales están siendo redescubiertos y aplicados en la innovación contemporánea. Conecta el método histórico con aplicaciones modernas. Establece hallazgos concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Recreate the atmosphere of a medieval innovation salon where scholars are debating a revolutionary invention. Capture the intellectual fervor and social transformation. End with definitive impacts.',
          es: 'Recrea la atmósfera de un salón innovador medieval donde eruditos están debatiendo una invención revolucionaria. Captura el fervor intelectual y la transformación social. Termina con impactos definitivos.'
        }
      },
      Industrial: {
        'o4-mini': {
          en: 'Conduct a thorough analysis of an Industrial Revolution innovation breakthrough, examining cause-and-effect relationships, economic implications, and systematic changes to innovation expression. Present structured findings without queries.',
          es: 'Conduce un análisis exhaustivo de un avance innovador de la Revolución Industrial, examinando relaciones causa-efecto, implicaciones económicas y cambios sistemáticos en la expresión innovadora. Presenta hallazgos estructurados sin consultas.'
        },
        'grok-4': {
          en: 'Write as an industrial revolution era innovator who just invented something that would transform society. Blend period-appropriate excitement with modern hindsight and witty observations. Make it memorable without questions.',
          es: 'Escribe como un innovador de la era de la Revolución Industrial que acaba de inventar algo que transformaría la sociedad. Mezcla emoción apropiada del período con retrospectiva moderna y observaciones ingeniosas. Hazlo memorable sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate how specific Industrial Revolution innovation advancements are being reimagined today. Connect historical patents with modern innovations and emerging trends. Deliver conclusive insights.',
          es: 'Investiga cómo las innovaciones innovadoras específicas de la Revolución Industrial están siendo reimaginadas hoy. Conecta patentes históricas con innovaciones modernas y tendencias emergentes. Entrega percepciones concluyentes.'
        },
        'gemini-1.5-flash': {
          en: 'Transport readers to a bustling innovation hub where a new innovation technology is changing everything. Show the human side of innovation progress through multiple viewpoints. Conclude with transformative impacts.',
          es: 'Transporta a los lectores a un hub de innovación bullicioso donde una nueva tecnología de innovación está cambiando todo. Muestra el lado humano del progreso innovador a través de múltiples puntos de vista. Concluye con impactos transformadores.'
        }
      },
      Modern: {
        'o4-mini': {
          en: 'Perform a comprehensive analysis of a cutting-edge innovation advancement, evaluating its technical specifications, market potential, and societal implications through evidence-based reasoning. State definitive conclusions.',
          es: 'Realiza un análisis comprensivo de un avance innovador de vanguardia, evaluando sus especificaciones técnicas, potencial de mercado e implicaciones sociales a través de razonamiento basado en evidencia. Establece conclusiones definitivas.'
        },
        'grok-4': {
          en: 'Become a modern innovator who stumbled upon a scientific discovery that would revolutionize human civilization. Write with infectious enthusiasm and just the right amount of healthy skepticism. Keep it captivating without queries.',
          es: 'Conviértete en un innovador moderno que se topó con un descubrimiento científico que revolucionaría la civilización humana. Escribe con entusiasmo contagioso y la cantidad justa de escepticismo saludable. Mantenlo cautivador sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Research the latest innovation breakthroughs that are currently making waves in innovation journals and news. Synthesize real data, expert opinions, and market analysis. Present authoritative findings without questions.',
          es: 'Investiga los últimos avances innovadores que actualmente están causando revuelo en revistas innovadoras y noticias. Sintetiza datos reales, opiniones de expertos y análisis de mercado. Presenta hallazgos autoritativos sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Create a multi-dimensional narrative about how a modern innovation discovery is reshaping human connection. Blend technical innovation with personal stories and cultural impact. End with clear transformative insights.',
          es: 'Crea una narrativa multidimensional sobre cómo un descubrimiento innovador moderno está remodelando la conexión humana. Mezcla innovación técnica con historias personales e impacto cultural. Termina con percepciones transformadoras claras.'
        }
      },
      Future: {
        'o4-mini': {
          en: 'Construct a logical framework for a futuristic innovation breakthrough, analyzing its theoretical foundations, implementation challenges, and probable societal adoption patterns. Present reasoned projections without questions.',
          es: 'Construye un marco lógico para un avance innovador futurista, analizando sus fundamentos teóricos, desafíos de implementación y patrones probables de adopción social. Presenta proyecciones razonadas sin preguntas.'
        },
        'grok-4': {
          en: 'Channel a time traveler from 2050 casually explaining how they solved problems we\'re still puzzling over. Make the impossible sound delightfully inevitable with characteristic wit. Keep it engaging without queries.',
          es: 'Canaliza un viajero en el tiempo del 2050 explicando casualmente cómo resolvieron problemas que aún nos desconciertan. Haz que lo imposible suene deliciosamente inevitable con ingenio característico. Mantenlo atractivo sin consultas.'
        },
        'perplexity-sonar': {
          en: 'Investigate emerging innovation research and technological advancements that could lead to revolutionary breakthroughs. Analyze current trends and extrapolate realistic future scenarios. Deliver compelling projections without questions.',
          es: 'Investiga investigación innovadora emergente y avances tecnológicos que podrían llevar a avances revolucionarios. Analiza tendencias actuales y extrapola escenarios futuros realistas. Entrega proyecciones convincentes sin preguntas.'
        },
        'gemini-1.5-flash': {
          en: 'Envision a future where innovation breakthroughs seamlessly integrate into human connection. Show the ripple effects across multiple aspects of society and culture. Conclude with transformative possibilities.',
          es: 'Visualiza un futuro donde los avances innovadores se integran perfectamente en la conexión humana. Muestra los efectos dominó a través de múltiples aspectos de la sociedad y cultura. Concluye con posibilidades transformadoras.'
        }
      }
    }
  }
  },

  // Enhanced backend model-specific templates for substantive content
  backendPrompts: {
    'o4-mini': {
      en: 'Execute comprehensive systematic analysis of {category} innovations within {epoch} historical context. Apply rigorous logical reasoning, structured analytical methodology, and evidence-based evaluation. Generate detailed narrative of 300-500 words with specific examples, technical specifications, cultural impact assessment, and concrete implications. Include cause-effect relationships, data-driven insights, and empirical evidence. Provide substantive analytical content with definitive conclusions and authoritative technical assessment. Never end with questions, suggestions, or prompts - always conclude with definitive statements and clear analytical insights.',
      es: 'Ejecuta análisis sistemático comprensivo de innovaciones de {category} dentro del contexto histórico {epoch}. Aplica razonamiento lógico riguroso, metodología analítica estructurada y evaluación basada en evidencia. Genera narrativa detallada de 300-500 palabras con ejemplos específicos, especificaciones técnicas, evaluación de impacto cultural e implicaciones concretas. Incluye relaciones causa-efecto, percepciones basadas en datos y evidencia empírica. Proporciona contenido analítico sustantivo con conclusiones definitivas y evaluación técnica autoritativa. Nunca termines con preguntas, sugerencias o incitaciones - siempre concluye con declaraciones definitivas y percepciones analíticas claras.'
    },
    'grok-4': {
      en: 'Create witty, engaging, and substantially detailed {category} content from {epoch} era with characteristic humor, fresh perspective, and entertaining insights. Generate 350-500 words of entertaining yet informative content that balances humor with substance. Include colorful descriptions, memorable analogies, personality-driven observations, clever comparisons, specific examples, and vivid imagery. Make it memorable, entertaining, and substantive. Always end statements definitively with conclusive insights and memorable observations. Never pose questions to the reader or suggest further exploration.',
      es: 'Crea contenido ingenioso, atractivo y sustancialmente detallado de {category} de la era {epoch} con humor característico, perspectiva fresca y percepciones entretenidas. Genera 350-500 palabras de contenido entretenido pero informativo que equilibre humor con sustancia. Incluye descripciones coloridas, analogías memorables, observaciones impulsadas por personalidad, comparaciones inteligentes, ejemplos específicos e imágenes vívidas. Hazlo memorable, entretenido y sustantivo. Siempre termina declaraciones definitivamente con percepciones concluyentes y observaciones memorables. Nunca hagas preguntas al lector o sugieras exploración adicional.'
    },
    'perplexity-sonar': {
      en: 'Research and synthesize comprehensive real data about {category} from {epoch} period using multiple authoritative sources and current findings. Generate 400-600 words of authoritative, well-researched content that integrates peer-reviewed research, expert analysis, and documented evidence. Present detailed technical specifications, historical documentation, scholarly insights, specific data points, statistical information, and concrete evidence. Include extensive analysis from credible sources. Always present information definitively with research-backed conclusions and never end with questions, suggestions for further research, or calls to action.',
      es: 'Investiga y sintetiza datos reales comprensivos sobre {category} del período {epoch} usando múltiples fuentes autoritativas y hallazgos actuales. Genera 400-600 palabras de contenido autoritativo y bien investigado que integre investigación revisada por pares, análisis de expertos y evidencia documentada. Presenta especificaciones técnicas detalladas, documentación histórica, percepciones académicas, puntos de datos específicos, información estadística y evidencia concreta. Incluye análisis extenso de fuentes creíbles. Siempre presenta información definitivamente con conclusiones respaldadas por investigación y nunca termines con preguntas, sugerencias para investigación adicional o llamadas a la acción.'
    },
    'gemini-1.5-flash': {
      en: 'Weave rich, multi-perspective narrative about {category} in {epoch} context that blends multiple viewpoints, cultural elements, and human experiences. Generate 450-650 words of engaging narrative that creates immersive storytelling with detailed character perspectives, sensory descriptions, and emotional resonance. Include technical innovation alongside personal stories, cultural transformation, and societal impact. Synthesize complex information into compelling storytelling with specific details, vivid scenes, and character development. Always conclude with clear insights and transformative outcomes, never ending with questions, open-ended speculation, or suggestions for further exploration.',
      es: 'Teje narrativa rica y multi-perspectiva sobre {category} en contexto {epoch} que mezcle múltiples puntos de vista, elementos culturales y experiencias humanas. Genera 450-650 palabras de narrativa atractiva que cree narración inmersiva con perspectivas detalladas de personajes, descripciones sensoriales y resonancia emocional. Incluye innovación técnica junto con historias personales, transformación cultural e impacto social. Sintetiza información compleja en narración convincente con detalles específicos, escenas vívidas y desarrollo de personajes. Siempre concluye con percepciones claras y resultados transformadores, nunca terminando con preguntas, especulación abierta o sugerencias para exploración adicional.'
    }
  },

  // Enhanced system prompts for substantive content
  systemPrompts: {
    en: 'You are an expert content creator specializing in substantive, engaging, model-specific narratives. Generate detailed, informative content of 250-500 words that provides comprehensive insights, specific examples, and valuable information. Always end statements definitively with conclusive insights, concrete outcomes, or authoritative declarations. Never ask questions, never prompt user responses, and never end with suggestions for further exploration. Focus on delivering complete, self-contained information that thoroughly educates and engages.',
    es: 'Eres un creador de contenido experto especializado en narrativas sustantivas, atractivas y específicas del modelo. Genera contenido detallado e informativo de 250-500 palabras que proporcione percepciones comprensivas, ejemplos específicos e información valiosa. Siempre termina declaraciones definitivamente con percepciones concluyentes, resultados concretos o declaraciones autoritativas. Nunca hagas preguntas, nunca incites respuestas del usuario y nunca termines con sugerencias para exploración adicional. Enfócate en entregar información completa y autocontenida que eduque y atraiga exhaustivamente.'
  },

  // Enhanced web search prompts for learn more functionality
  webSearchPrompts: {
    en: 'Research and compile comprehensive, detailed information about: {message}. Provide extensive, authoritative content of 400-600 words that significantly expands understanding with specific data, expert insights, historical context, current developments, and future implications. Include concrete examples, statistical information, technical specifications, and scholarly perspectives. Generate substantive information with definitive insights and authoritative conclusions. Never end with questions, suggestions for further reading, or prompts for user action - always conclude with concrete information and actionable insights.',
    es: 'Investiga y compila información comprensiva y detallada sobre: {message}. Proporciona contenido extenso y autoritativo de 400-600 palabras que expanda significativamente el entendimiento con datos específicos, percepciones expertas, contexto histórico, desarrollos actuales e implicaciones futuras. Incluye ejemplos concretos, información estadística, especificaciones técnicas y perspectivas académicas. Genera información sustantiva con percepciones definitivas y conclusiones autoritativas. Nunca termines con preguntas, sugerencias para lectura adicional o incitaciones para acción del usuario - siempre concluye con información concreta y percepciones accionables.'
  },

  // Fallback stories with model personality
  fallbackStories: {
    en: {
      headline: 'Discovering {category} Wonders',
      summary: 'Fascinating developments in {category} continue to inspire and amaze.',
      fullText: 'The realm of {category} offers endless discoveries that capture our imagination and drive human progress forward.',
      source: 'Orb Game Discovery Engine'
    },
    es: {
      headline: 'Descubriendo Maravillas de {category}',
      summary: 'Desarrollos fascinantes en {category} continúan inspirando y asombrando.',
      fullText: 'El reino de {category} ofrece descubrimientos infinitos que capturan nuestra imaginación e impulsan el progreso humano hacia adelante.',
      source: 'Motor de Descubrimiento Orb Game'
    }
  },

  // TTS voices optimized for content
  ttsVoices: {
    en: 'alloy',
    es: 'jorge'
  },

  // Model-specific JSON response formats
  jsonResponseFormat: {
    'o4-mini': 'Return analytical JSON: [{ "headline": "Systematic title", "summary": "Logical overview", "fullText": "Structured analysis with definitive conclusion", "source": "o4-mini Analysis" }]',
    'grok-4': 'Return engaging JSON: [{ "headline": "Witty title", "summary": "Clever overview", "fullText": "Entertaining narrative with memorable ending", "source": "Grok Perspective" }]',
    'perplexity-sonar': 'Return research JSON: [{ "headline": "Evidence-based title", "summary": "Data-driven overview", "fullText": "Well-researched content with authoritative conclusion", "source": "Perplexity Research" }]',
    'gemini-1.5-flash': 'Return narrative JSON: [{ "headline": "Rich title", "summary": "Multi-layered overview", "fullText": "Immersive story with clear resolution", "source": "Gemini Synthesis" }]'
  }
}; 