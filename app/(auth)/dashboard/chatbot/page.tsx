"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot } from "lucide-react"

interface Message {
  id: number
  type: "user" | "bot"
  text: string
  timestamp: Date
  confirmation?: {
    amount: number
    category: string
    split: string
  }
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      text: 'Olá! Sou seu assistente financeiro. Você pode me dizer seus gastos de forma natural, como "Gastei 120 no mercado hoje".',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate bot response with expense detection
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        type: "bot",
        text: "Entendi! Detectei um gasto.",
        timestamp: new Date(),
        confirmation: {
          amount: 120,
          category: "Mercado",
          split: "50/50",
        },
      }
      setMessages((prev) => [...prev, botMessage])
    }, 500)

    setInputValue("")
  }

  const handleConfirm = () => {
    const confirmMessage: Message = {
      id: messages.length + 1,
      type: "bot",
      text: "Despesa registrada com sucesso! ✓",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, confirmMessage])
  }

  const handleEdit = () => {
    alert("Redirecionando para edição...")
  }

  const handleCancel = () => {
    const cancelMessage: Message = {
      id: messages.length + 1,
      type: "bot",
      text: "Ok, operação cancelada.",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, cancelMessage])
  }

  return (
    <DashboardLayout>
      <div className="max-w-full lg:max-w-4xl h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Assistente Financeiro</h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Registre despesas conversando naturalmente
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl flex flex-col overflow-hidden shadow-lg shadow-primary/5">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      message.type === "bot" ? "bg-primary/20" : "bg-secondary"
                    }`}
                  >
                    {message.type === "bot" ? (
                      <Bot className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 bg-primary rounded-full" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div>
                    <div
                      className={`rounded-2xl p-4 ${
                        message.type === "bot" ? "bg-secondary/50" : "bg-primary/20 border border-primary/30"
                      }`}
                    >
                      <p className="text-foreground">{message.text}</p>
                    </div>

                    {/* Confirmation Card */}
                    {message.confirmation && (
                      <div className="mt-3 bg-card border-2 border-primary/30 rounded-xl p-4">
                        <p className="text-sm font-semibold text-foreground mb-3">Confirmar gasto:</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Valor:</span>
                            <span className="text-sm font-bold text-foreground">
                              R$ {message.confirmation.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Categoria:</span>
                            <span className="text-sm font-medium text-primary">{message.confirmation.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Divisão:</span>
                            <span className="text-sm font-medium text-foreground">{message.confirmation.split}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleConfirm}
                            size="sm"
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Confirmar
                          </Button>
                          <Button
                            onClick={handleEdit}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-border/50 bg-transparent"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-border/20 p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem... Ex: Gastei 120 no mercado"
                className="flex-1 bg-input border-border/20 h-12"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
