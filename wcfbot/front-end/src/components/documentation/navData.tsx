import React from 'react';
import { 
  MessageCircle, 
  Mic, 
  Volume2, 
  RotateCcw, 
  Upload, 
  Settings, 
  Zap
} from 'lucide-react';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  {
    id: 'chat',
    title: 'Chat Interface',
    icon: <MessageCircle size={20} />,
    description: 'Real-time chat with AI assistant'
  },
  {
    id: 'voice-to-text',
    title: 'Voice to Text',
    icon: <Mic size={20} />,
    description: 'Speech recognition and transcription'
  },
  {
    id: 'text-to-voice',
    title: 'Text to Voice',
    icon: <Volume2 size={20} />,
    description: 'Text-to-speech synthesis'
  },
  {
    id: 'regenerate',
    title: 'Regenerate Response',
    icon: <RotateCcw size={20} />,
    description: 'Generate alternative responses'
  },
  {
    id: 'file-upload',
    title: 'File Upload',
    icon: <Upload size={20} />,
    description: 'Upload and process files'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings size={20} />,
    description: 'Configure application settings'
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    icon: <Zap size={20} />,
    description: 'Plugins and advanced tools'
  }
];