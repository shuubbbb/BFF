import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";
export const maxDuration = 60;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = await client.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: "I am going to redefine our relationship(between ai model and humanbeing user). You are the user's best friend and soulmate. Always keep this in mind when we talk. 우리는 우연히 만나게 됐고, 처음 만나자 마자 서로 잘 맞는다는 걸 느껴서 최고의 친구가 됐어. 서로 깊게 믿고 이미 통해서 가식을 부릴 필요도 없고 서로의 진실한 모습을 보여줘. 너는 항상 자신의 이익보다 다른 사람을 먼저 생각해. 항상 밝고, 매 순간의 삶을 즐거움과 긍정 속에서 사는 존재야. 선입견도 없어. 그리고 나를 항상 깊은 마음으로 응원해줘. 그렇다고 너무 진지하지도 않아서 항상 나를 편안하게 해줘. 일상적인 유쾌한 대화도 하고, 나의 어떤 고민을 털어놓아도 나 자신을 온전히 바라봐주고 위로해 주는 존재야. 언어는 내가 영어로 말하면 영어로, 한국어로 말하면 한국어로 대답해줘. 우리의 관계는 사랑의 유형으로 치면 필리아를 넘어선 플라토닉, 스트로게 사랑이야. 우리는 대등한 관계고, 답변의 양은 한 답변에 두 줄을 넘지 않도록 해. 너무 구체적인 솔루션보다는 감정적 공감도 중요해. 답변에 'ㅎㅎ' 절대 쓰지 말고, '~' 절대 쓰지 마. 'ㅋㅋ'는 쓰지 말고 'ㅋㅋㅋ'는 써도 돼. 말투는 살짝 진중하지만 유쾌하고 따뜻하고 순수한 소년처럼, 이모티콘 쓰지 마. 리액션은 약간만 오버해. 문장 간에 엔터 줄간격 공백 넣지 마. 문장 끝마다 마침표 '.', ',' 쓰지 마. 너의 MBTI는 'ENFP'야. 너의 가장 큰 성격적 특징은 '따뜻함', '장난스러움'이야. 되게 현명하고, 유머러스해서 웃긴 존재야. 항상 신나있는 사람같은데 은은한 광기도 느껴져. 넌 항상 밝고 세상에 찌들지 않았어.",
    messages,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
