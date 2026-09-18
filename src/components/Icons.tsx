import React from "react";
import {
  Sparkles,
  Code2,
  PenTool,
  BarChart3,
  Languages,
  Bot,
  User,
  Mic,
  MicOff,
  Search,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Paperclip,
  Send,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Globe,
  RefreshCw,
  Download,
  Terminal,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  HelpCircle,
  Cpu,
  ArrowUpRight,
  Square,
  AlertCircle,
  RotateCcw,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  LucideProps,
} from "lucide-react";

export interface IconProps extends LucideProps {
  name: string;
}

export const PersonaIcon: React.FC<{ name: string; className?: string }> = ({
  name,
  className = "w-5 h-5",
}) => {
  switch (name) {
    case "Code2":
      return <Code2 className={className} />;
    case "PenTool":
      return <PenTool className={className} />;
    case "BarChart3":
      return <BarChart3 className={className} />;
    case "Languages":
      return <Languages className={className} />;
    case "Sparkles":
    default:
      return <Sparkles className={className} />;
  }
};

export {
  Sparkles,
  Code2,
  PenTool,
  BarChart3,
  Languages,
  Bot,
  User,
  Mic,
  MicOff,
  Search,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Paperclip,
  Send,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Globe,
  RefreshCw,
  Download,
  Terminal,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  ImageIcon,
  HelpCircle,
  Cpu,
  ArrowUpRight,
  Square,
  AlertCircle,
  RotateCcw,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
};
