# Notas de voz — 2026-08-07 (WhatsApp)

> Transcripción automática (faster-whisper, modelo `small`, es) del archivo
> `WhatsApp Ptt 2026-08-07 at 5.48.01 PM.ogg`. Editada solo para quitar muletillas
> obvias; el contenido es tal como se entendió.

Sí, sí, porque como usted dice, lo lógico sería que cada persona tuviera su propia
cuenta en la barra y todo lo demás. Más, creo... o sea, de características del bicho
yo diría como fotos: buscar a ver si hay del adulto promedio y de los juveniles, y es
que es diferente el bichillo macho y hembra, que a veces hay [audio poco claro], un
poco de información, o sea, de historia natural básica, con una pequeña descripción.
Este, como, usualmente hace tal sonido, de tal forma. Y así, como un mini texto —pero
mini, mini— del bicho, de dónde se encuentra.

Si se podría poner como un mapa de Costa Rica, de qué región es, y que a su vez haya
una forma de explorar los animales por región. Ah, bueno, qué tan frecuente es el
bicho en dicha región, y no sé si con eso se podrán colectar datos de usuarios que
digan "yo vi este bicho aquí", y que con eso también se puedan corregir las
frecuencias y todo eso — porque una cosa es reportarlo como raro por anécdota, y
otra que haya datos reales de que el bicho es raro.

Y no sé, si hay alguna forma de agregar una foto del bicho pero que no sea
compartida —me entienden— sino que yo tenga mi propio álbum de los bichillos, y les
ponga una estrellita, un corazoncito o algo así a los favoritos.

## Lectura como requerimientos (a confirmar con el usuario)

- Campos nuevos en `especie`: foto(s) diferenciadas por sexo (macho/hembra) y por
  etapa (adulto/juvenil), sonido característico, mini-texto de ubicación (distinto de
  `habitat_es/en`, más corto).
- **Frecuencia/rareza por región** como dato semi-derivado: una estimación inicial
  (curada) que se corrige con datos agregados de `avistamiento` reales, en vez de
  quedarse solo en la etiqueta anecdótica.
- **Álbum personal no compartido** con favoritos (★ / ♥) — foto del propio usuario,
  visible solo para él. Esto podría **tensionar** con la decisión ya tomada en la
  entrevista de un feed social público de avistamientos — hay que reconciliar si son
  dos cosas distintas (avistamiento público + álbum privado) o si esto reemplaza al
  feed social. Ver pregunta al usuario.
