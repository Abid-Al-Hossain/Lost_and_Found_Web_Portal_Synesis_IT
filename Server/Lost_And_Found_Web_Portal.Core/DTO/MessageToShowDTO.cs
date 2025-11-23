using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using Lost_And_Found_Web_Portal.Core.DTO;
using System;
using System.Collections.Generic;


namespace Lost_And_Found_Web_Portal.Core.DTO
{
    public class MessageToShowDTO
    {
        public Guid MessageId { get; set; }
        public Guid ThreadId { get; set; }
        public Guid SenderId { get; set; }
        public string? SenderName { get; set; }
        public string? Text { get; set; }
        public DateTime SentAt { get; set; }
        public string? base64stringImage { get; set; }
    }
}
public static class MessageExtensions
{
    public static MessageToShowDTO ToMessageToShowDTO(this Message message)
    {
        return new MessageToShowDTO
        {
            MessageId = message.MessageId,
            ThreadId = message.ThreadId,
            SenderId = message.SenderId,
            SenderName = "",
            Text = message.TextContent,
            SentAt = message.SentAt,
        };
    }
}