// Global event system for call-related events
const callEvents = {
  // Event listeners
  listeners: {
    incomingCall: [],
    callAccepted: [],
    callRejected: [],
    callEnded: []
  },
  
  // Add event listener
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => this.off(event, callback);
  },
  
  // Remove event listener
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },
  
  // Trigger event
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event handler:`, error);
        }
      });
    }
  }
};

export default callEvents;
