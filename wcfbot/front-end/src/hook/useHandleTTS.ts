import { fetchTTSAudio } from "@/services/voiceService";

export const handleTTSGeneration = async (text: string) => {
    try {
      console.log("Generating TTS for:", text);
      const response = await fetchTTSAudio(text);
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      // Play the audio
      await audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      // Clean up on error
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        console.error("Error playing TTS audio");
      };
      
    } catch (error) {
      console.error("Error generating or playing TTS:", error);
    }
  };