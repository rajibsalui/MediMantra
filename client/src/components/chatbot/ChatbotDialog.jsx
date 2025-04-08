"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X, Sparkles, Brain, User } from "lucide-react"
import MedicalDisclaimer from "./MedicalDisclaimer"
import axios from "axios"
import { API_URL } from "@/config/environment"

export default function ChatbotDialog({ open, onOpenChange }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Mediमंत्र, your AI medical assistant. How can I help you today? Remember, I'm here to provide information, but not to replace professional medical advice.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get temporary user ID (in a real app, you would use authenticated user ID)
      const userId = localStorage.getItem('userId') ||
                    `user_${Math.random().toString(36).substring(2, 15)}`;

      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', userId);
      }

      // Call the chatbot API
      const response = await axios.post(`${API_URL}/chatbot/query`, {
        query: userMessage.content,
        userId: userId
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] h-[600px] max-h-[80vh] p-0 gap-0 flex flex-col bg-white dark:bg-slate-950">
        <DialogHeader className="p-6 pb-2 border-b dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg text-slate-900 dark:text-slate-100">Mediमंत्र AI</DialogTitle>
                <DialogDescription className="text-xs flex items-center text-slate-600 dark:text-slate-400">
                  <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                  AI-powered medical assistant
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  setMessages([
                    {
                      role: "assistant",
                      content: "Hello! I'm Mediमंत्र, your AI medical assistant. How can I help you today? Remember, I'm here to provide information, but not to replace professional medical advice.",
                      timestamp: new Date(),
                    },
                  ])
                }}
              >
                New Chat
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-slate-900  flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 max-w-[90%]",
                    message.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 rounded-full border",
                    message.role === "assistant"
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  )}>
                    {message.role === "assistant" ? (
                      <Brain className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </Avatar>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "rounded-lg p-3 max-w-full",
                      message.role === "assistant"
                        ? "bg-white dark:bg-slate-800 shadow-sm dark:shadow-none text-black"
                        : "bg-blue-600 dark:bg-blue-700 text-white"
                    )}
                  >
                    <div className={`prose dark:prose-invert  prose-sm break-words ${message.role === "assistant" ? "text-slate-900 dark:text-slate-100" : "prose-p:text-black"}`}>
                      {message.content}
                    </div>
                    <div className={cn(
                      "text-[10px] mt-1 text-right",
                      message.role === "assistant" ? "text-gray-400 dark:text-gray-500" : "text-blue-100"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 max-w-[90%]">
                  <Avatar className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white border border-blue-600 dark:border-blue-700">
                    <Brain className="h-5 w-5" />
                  </Avatar>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm dark:shadow-none">
                    <div className="flex space-x-2 items-center h-5">
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-end gap-2">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg flex-1 border dark:border-slate-800">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your health..."
                className="min-h-[60px]  max-h-[200px] border-0 focus-visible:ring-0 bg-transparent text-slate-900 dark:bg-blue-950 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-full h-10 w-10 p-2"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
              <span>
                <MedicalDisclaimer>
                  <Button variant="link" className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Medical disclaimer
                  </Button>
                </MedicalDisclaimer>
              </span>
              <span className="flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                Powered by Mediमंत्र AI
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
