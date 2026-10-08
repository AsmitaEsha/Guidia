// Shows server notifications in the reader's language. The API stores an
// i18n { key, vars } with each alert; older alerts fall back to their text.

const ACTION = {
  SEND_MONEY: ['sending money', 'টাকা পাঠানো', 'पैसे भेजना', 'gửi tiền'],
  PAY_BILL: ['paying a bill', 'বিল দেওয়া', 'बिल भरना', 'trả hóa đơn'],
  SEND_MESSAGE: ['sending a message', 'মেসেজ পাঠানো', 'मैसेज भेजना', 'gửi tin nhắn'],
  READ_EMAIL: ['reading an email', 'ইমেইল পড়া', 'ईमेल पढ़ना', 'đọc email'],
};
const REASON = {
  I_AM_CONFUSED: ['They feel confused and would like help', 'উনি দিশেহারা বোধ করছেন, সাহায্য চান', 'वे उलझन में हैं और मदद चाहते हैं', 'Họ đang bối rối và cần giúp'],
  I_THINK_THIS_IS_UNSAFE: ['They think something may be unsafe', 'উনার মনে হচ্ছে কিছু একটা বিপজ্জনক', 'उन्हें लगता है कुछ खतरनाक है', 'Họ nghĩ có điều gì đó không an toàn'],
  I_MAY_HAVE_MADE_A_MISTAKE: ['They think they may have made a mistake', 'উনার মনে হচ্ছে ভুল হয়ে গেছে', 'उन्हें लगता है गलती हो गई है', 'Họ nghĩ mình có thể đã làm sai'],
  PAYMENT_HELP: ['They need help with a payment', 'পেমেন্ট নিয়ে উনার সাহায্য দরকার', 'उन्हें भुगतान में मदद चाहिए', 'Họ cần giúp về thanh toán'],
  APPOINTMENT_HELP: ['They need help with an appointment', 'অ্যাপয়েন্টমেন্ট নিয়ে উনার সাহায্য দরকার', 'उन्हें अपॉइंटमेंट में मदद चाहिए', 'Họ cần giúp về lịch hẹn'],
  OTHER: ['They asked for help', 'উনি সাহায্য চেয়েছেন', 'उन्होंने मदद मांगी है', 'Họ đã nhờ giúp đỡ'],
};

function action(t, type) {
  return ACTION[type] ? t(...ACTION[type]) : String(type || '').replace(/_/g, ' ').toLowerCase();
}

/** { title, body } for a notification, in the current language. */
export function notificationText(n, t) {
  const i = n.data?.i18n;
  if (!i) return { title: n.title, body: n.body };
  const v = i.vars || {};
  const name = v.name || '';
  switch (i.key) {
    case 'approval_request':
      return {
        title: t(`${name} is asking for your approval`, `${name} আপনার অনুমতি চাইছেন`, `${name} आपकी मंज़ूरी मांग रहे हैं`, `${name} đang xin bạn đồng ý`),
        body: t(`Practice ${action(t, v.action)}${v.amount ? ` of ${v.amount}` : ''} in ${v.app}. No real money moves.`, `${v.app}-এ ${action(t, v.action)}-এর অনুশীলন${v.amount ? ` (${v.amount})` : ''}। আসল টাকা যাবে না।`, `${v.app} में ${action(t, v.action)} का अभ्यास${v.amount ? ` (${v.amount})` : ''}। असली पैसे नहीं जाएंगे।`, `Luyện tập ${action(t, v.action)}${v.amount ? ` ${v.amount}` : ''} trong ${v.app}. Không có tiền thật.`),
      };
    case 'approval_result':
      return v.decision === 'APPROVED'
        ? { title: t('Your family approved', 'পরিবার অনুমতি দিয়েছে', 'परिवार ने मंज़ूरी दी', 'Gia đình đã đồng ý'), body: t(`${name} approved your practice.`, `${name} আপনার অনুশীলনে অনুমতি দিয়েছেন।`, `${name} ने आपके अभ्यास को मंज़ूरी दी।`, `${name} đã đồng ý bài luyện tập của bạn.`) }
        : { title: t('Your family would like to talk first', 'পরিবার আগে একটু কথা বলতে চায়', 'परिवार पहले बात करना चाहता है', 'Gia đình muốn nói chuyện trước'), body: t(`${name} paused your practice for a chat.`, `${name} কথা বলার জন্য অনুশীলনটা থামিয়েছেন।`, `${name} ने बात करने के लिए अभ्यास रोका है।`, `${name} đã tạm dừng để nói chuyện với bạn.`) };
    case 'emergency':
      return { title: t(`${name} asked for help`, `${name} সাহায্য চেয়েছেন`, `${name} ने मदद मांगी है`, `${name} cần giúp đỡ`), body: t(...(REASON[v.reason] || REASON.OTHER)) };
    case 'emergency_update': {
      const words = {
        acknowledge: [`${name} has seen your request for help`, `${name} আপনার সাহায্যের অনুরোধ দেখেছেন`, `${name} ने आपका मदद का अनुरोध देख लिया है`, `${name} đã thấy yêu cầu trợ giúp của bạn`],
        contacted: [`${name} says they have contacted you`, `${name} বলছেন আপনার সাথে যোগাযোগ করেছেন`, `${name} कहते हैं उन्होंने आपसे संपर्क किया है`, `${name} cho biết đã liên lạc với bạn`],
        resolve: [`${name} marked your request as resolved`, `${name} জানিয়েছেন সমস্যার সমাধান হয়েছে`, `${name} ने बताया कि मामला सुलझ गया`, `${name} đã đánh dấu là đã giải quyết`],
      };
      return {
        title: t(...(words[v.action] || words.acknowledge)),
        body: v.action === 'acknowledge' ? t('Help is on the way. Stay where you are and take a slow breath.', 'সাহায্য আসছে। যেখানে আছেন সেখানেই থাকুন, ধীরে শ্বাস নিন।', 'मदद आ रही है। जहां हैं वहीं रहें और धीरे सांस लें।', 'Đang có người đến giúp. Hãy ở yên và thở chậm lại.') : '',
      };
    }
    case 'family_connected':
      return { title: t(`${name} is now connected as your family`, `${name} এখন পরিবার হিসেবে যুক্ত`, `${name} अब आपके परिवार के रूप में जुड़े हैं`, `${name} đã kết nối là gia đình của bạn`), body: t('They will be told when you press "I need help". You can change what they see in Trusted people.', '"আমার সাহায্য দরকার" চাপলে উনি জানতে পারবেন। উনি কী দেখবেন তা "বিশ্বস্ত মানুষ"-এ বদলাতে পারেন।', '"मुझे मदद चाहिए" दबाने पर उन्हें पता चलेगा। वे क्या देखें, यह "भरोसेमंद लोग" में बदल सकते हैं।', 'Họ sẽ được báo khi bạn nhấn "Tôi cần giúp". Bạn có thể đổi những gì họ thấy trong "Người tin cậy".') };
    case 'guardian_invite':
      return { title: t(`${name} invited you to be a trusted person`, `${name} আপনাকে বিশ্বস্ত মানুষ হতে আমন্ত্রণ জানিয়েছেন`, `${name} ने आपको भरोसेमंद व्यक्ति बनने का न्योता दिया है`, `${name} mời bạn làm người tin cậy`), body: t('Open it to accept or decline.', 'গ্রহণ বা না করতে খুলুন।', 'स्वीकार या मना करने के लिए खोलें।', 'Mở để chấp nhận hoặc từ chối.') };
    case 'guardian_connected':
      return { title: t(`${name} is now one of your trusted people`, `${name} এখন আপনার বিশ্বস্ত মানুষ`, `${name} अब आपके भरोसेमंद लोगों में हैं`, `${name} giờ là người tin cậy của bạn`), body: t('You can change what they can see at any time.', 'উনি কী দেখবেন তা যেকোনো সময় বদলাতে পারেন।', 'वे क्या देख सकते हैं, यह कभी भी बदल सकते हैं।', 'Bạn có thể đổi những gì họ thấy bất cứ lúc nào.') };
    case 'guardian_revoked':
      return { title: t('A trusted-person connection ended', 'একজন বিশ্বস্ত মানুষের সাথে সংযোগ শেষ হয়েছে', 'एक भरोसेमंद व्यक्ति से जुड़ाव खत्म हुआ', 'Một kết nối người tin cậy đã kết thúc'), body: t(`${name} ended the connection on Guidia.`, `${name} গাইডিয়ায় সংযোগটা শেষ করেছেন।`, `${name} ने गाइडिया पर जुड़ाव खत्म किया।`, `${name} đã ngắt kết nối trên Guidia.`) };
    case 'sharing_changed':
      return { title: t('Your sharing settings changed', 'আপনার শেয়ারিং সেটিংস বদলেছে', 'आपकी शेयरिंग सेटिंग्स बदलीं', 'Cài đặt chia sẻ đã thay đổi'), body: t(`What ${name} can see was updated.`, `${name} কী দেখতে পাবেন তা বদলানো হয়েছে।`, `${name} क्या देख सकते हैं, यह बदला गया।`, `Những gì ${name} thấy đã được cập nhật.`) };
    case 'sharing_changed_guardian':
      return { title: t('Sharing settings changed', 'শেয়ারিং সেটিংস বদলেছে', 'शेयरिंग सेटिंग्स बदलीं', 'Cài đặt chia sẻ đã thay đổi'), body: t('The person you help updated what you can see.', 'যাঁকে সাহায্য করেন তিনি আপনি কী দেখবেন তা বদলেছেন।', 'जिनकी आप मदद करते हैं, उन्होंने बदला कि आप क्या देख सकते हैं।', 'Người bạn giúp đã đổi những gì bạn được xem.') };
    default:
      return { title: n.title, body: n.body };
  }
}
