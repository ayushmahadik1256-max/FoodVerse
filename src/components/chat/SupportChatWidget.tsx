import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Coins,
  Package,
  RotateCcw,
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Headphones,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Order } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'order' | 'loyalty' | 'coupon';
    order?: Order;
  };
  suggestions?: string[];
}

interface SupportChatWidgetProps {
  onOpenCart?: () => void;
  onNavigateToTracking?: () => void;
}

export const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({
  onOpenCart,
  onNavigateToTracking,
}) => {
  const {
    currentUser,
    orders,
    activeTrackingOrder,
    setActiveTrackingOrder,
    coupons,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `Hello ${currentUser.name.split(' ')[0]}! 👋 I'm FoodieBot, your FoodVerse live assistant. How can I help you today?`,
      timestamp: 'Just now',
      suggestions: [
        'Track my order 🛵',
        'Check loyalty points ⭐',
        'Available coupons 🏷️',
        'Delivery delay assistance ⏱️',
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages, isTyping]);

  const latestOrder = activeTrackingOrder || orders[0];

  const createChatId = (prefix: 'user' | 'bot') =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const generateBotReply = (userQuery: string): ChatMessage => {
    const q = userQuery.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Order Tracking / Delivery Status
    if (
      q.includes('track') ||
      q.includes('order') ||
      q.includes('where') ||
      q.includes('status') ||
      q.includes('delay') ||
      q.includes('late')
    ) {
      if (latestOrder) {
        const isCompleted = latestOrder.status === 'delivered';
        return {
          id: createChatId('bot'),
          sender: 'bot',
          text: isCompleted
            ? `Your last order #${latestOrder.orderNumber} was successfully delivered! Here are the details:`
            : `I located your active order #${latestOrder.orderNumber}! It is currently **${latestOrder.status.replace('_', ' ').toUpperCase()}** from ${latestOrder.restaurantName}.`,
          timestamp: timeStr,
          actionCard: {
            type: 'order',
            order: latestOrder,
          },
          suggestions: [
            'Track on Live GPS Map 🗺️',
            'Check loyalty points ⭐',
            'Contact courier partner 📞',
          ],
        };
      } else {
        return {
          id: createChatId('bot'),
          sender: 'bot',
          text: "You don't have any active orders right now. Browse our featured restaurants to place your first delectable meal!",
          timestamp: timeStr,
          suggestions: ['Check loyalty points ⭐', 'Available coupons 🏷️', 'Help with menu 🍔'],
        };
      }
    }

    // 2. Loyalty Points Inquiries
    if (
      q.includes('point') ||
      q.includes('loyalty') ||
      q.includes('balance') ||
      q.includes('reward') ||
      q.includes('redeem')
    ) {
      const points = currentUser.loyaltyPoints ?? 250;
      return {
        id: createChatId('bot'),
        sender: 'bot',
        text: `You have **${points} FoodVerse Points** in your wallet! 🪙\n\n• **Redemption Value:** 1 Point = ₹1.00 instant discount at checkout.\n• **Earning Rule:** You earn 10% back on every food order placed.\n• You can apply them seamlessly in the cart drawer before payment!`,
        timestamp: timeStr,
        actionCard: {
          type: 'loyalty',
        },
        suggestions: ['How to redeem points? 💡', 'Open my cart 🛒', 'Available coupons 🏷️'],
      };
    }

    // 3. Coupons / Discounts
    if (q.includes('coupon') || q.includes('promo') || q.includes('discount') || q.includes('offer')) {
      const activeCoupons = coupons.slice(0, 3);
      const couponList = activeCoupons
        .map((c) => `• **${c.code}**: ${c.discountPercentage}% OFF (Min ₹${c.minOrder})`)
        .join('\n');
      return {
        id: createChatId('bot'),
        sender: 'bot',
        text: `Here are today's top valid FoodVerse promo codes:\n\n${couponList}\n\nApply any of these directly at checkout for instant savings!`,
        timestamp: timeStr,
        actionCard: {
          type: 'coupon',
        },
        suggestions: ['Check loyalty points ⭐', 'Track my order 🛵', 'Open my cart 🛒'],
      };
    }

    // 4. Cancellation / Refund
    if (q.includes('cancel') || q.includes('refund') || q.includes('change')) {
      return {
        id: createChatId('bot'),
        sender: 'bot',
        text: `Orders can be cancelled free of charge within 60 seconds of placement if the restaurant has not yet begun preparing food. \n\nFor active orders in preparation, our support team can assist you with address changes or item adjustments. Would you like me to connect you with an executive?`,
        timestamp: timeStr,
        suggestions: ['Talk to human agent 👤', 'Track my order 🛵', 'No, that’s all thanks! 👍'],
      };
    }

    // 5. Connect to Human Agent
    if (q.includes('human') || q.includes('agent') || q.includes('executive') || q.includes('support')) {
      return {
        id: createChatId('bot'),
        sender: 'bot',
        text: `Connecting you to a FoodVerse priority care specialist... 🎧\n\n**Agent Connected:** Priya Sharma (Senior Support Lead)\n"Hello ${currentUser.name}! I am reviewing your account and active telemetry. How can I assist you today?"`,
        timestamp: timeStr,
        suggestions: ['Where is my delivery partner? 🛵', 'Check refund status 💳', 'Loyalty reward inquiry ⭐'],
      };
    }

    // Default Fallback
    return {
      id: createChatId('bot'),
      sender: 'bot',
      text: `I'm here to ensure your FoodVerse experience is exceptional. You can ask me to track your active delivery, inspect your loyalty points balance, find promo codes, or connect with a support agent.`,
      timestamp: timeStr,
      suggestions: [
        'Track my order 🛵',
        'Check loyalty points ⭐',
        'Available coupons 🏷️',
        'Talk to human agent 👤',
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: createChatId('user'),
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate realistic bot response delay
    setTimeout(() => {
      const botReply = generateBotReply(text);
      setIsTyping(false);
      setMessages((prev) => [...prev, botReply]);
    }, 750);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'bot',
        text: `Chat reset. Hello again ${currentUser.name.split(' ')[0]}! What can I help you resolve?`,
        timestamp: 'Just now',
        suggestions: [
          'Track my order 🛵',
          'Check loyalty points ⭐',
          'Available coupons 🏷️',
        ],
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3">
        {/* Unread banner when widget is closed */}
        {!isOpen && hasUnread && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl cursor-pointer hover:scale-105 transition-all animate-bounce"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Need help with your order?
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-bold">
              1
            </span>
          </div>
        )}

        <button
          id="foodverse-support-chat-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xl shadow-orange-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
          aria-label="Toggle Support Chat"
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white dark:border-stone-900 rounded-full" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Popover Window */}
      {isOpen && (
        <div
          className={`fixed bottom-36 md:bottom-24 right-4 sm:right-6 z-40 bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 flex flex-col overflow-hidden transition-all duration-200 ease-out ${
            isExpanded
              ? 'w-[calc(100vw-32px)] sm:w-[480px] h-[640px] max-h-[80vh]'
              : 'w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[75vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white font-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-orange-600 rounded-full" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <span>FoodieBot</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-medium">
                    AI Support
                  </span>
                </div>
                <div className="text-[11px] text-white/80 flex items-center gap-1">
                  <span>Instant answers & order help</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart chat"
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                title="Close chat"
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="px-4 py-2 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                {currentUser.name}
              </span>
              <span className="text-stone-400">•</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <Coins className="w-3 h-3" />
                {currentUser.loyaltyPoints ?? 250} pts
              </span>
            </div>
            {latestOrder && (
              <span className="px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-700 font-mono text-[10px] font-bold text-stone-800 dark:text-stone-200">
                #{latestOrder.orderNumber}
              </span>
            )}
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.id}_${idx}`}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5 border border-orange-200 dark:border-orange-800/40">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-tl-xs border border-stone-200/60 dark:border-stone-700/60'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Contextual Action Card: Active Order */}
                  {msg.actionCard?.type === 'order' && msg.actionCard.order && (
                    <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-stone-800 dark:text-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <Package className="w-3.5 h-3.5" />
                          {msg.actionCard.order.restaurantName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500/20 text-orange-700 dark:text-orange-300">
                          {msg.actionCard.order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                        <span>ETA: {msg.actionCard.order.estimatedDeliveryTime}</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          ₹{msg.actionCard.order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (msg.actionCard?.order) {
                            setActiveTrackingOrder(msg.actionCard.order);
                            onNavigateToTracking?.();
                            setIsOpen(false);
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center gap-1.5 hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Open Live Tracking</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Contextual Action Card: Loyalty */}
                  {msg.actionCard?.type === 'loyalty' && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-stone-800 dark:text-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            FoodVerse Wallet
                          </span>
                        </div>
                        <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                          {currentUser.loyaltyPoints ?? 250} Points
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">
                        Redeemable for <strong>₹{currentUser.loyaltyPoints ?? 250}.00</strong> discount on any order!
                      </div>
                      <button
                        onClick={() => {
                          onOpenCart?.();
                          setIsOpen(false);
                        }}
                        className="w-full py-1.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                      >
                        Apply in Cart 🛒
                      </button>
                    </div>
                  )}

                  {/* Contextual Action Card: Coupon */}
                  {msg.actionCard?.type === 'coupon' && (
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-between text-[11px]">
                      <span className="font-bold">Use code: WELCOME50</span>
                      <button
                        onClick={() => {
                          onOpenCart?.();
                          setIsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                      >
                        Redeem
                      </button>
                    </div>
                  )}

                  {/* Suggestions Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(s)}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 transition-all text-[11px]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-stone-400 px-1">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800/40">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200/80 dark:border-stone-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about orders, loyalty points, coupons..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-stone-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-500/20 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
