// ConversationItemRow.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ConversationItemRow = ({ conversation, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {conversation.conversationWith.name}
        </Text>
        <Text style={{ color: '#777' }}>{conversation.lastMessage.text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ConversationItemRow;
