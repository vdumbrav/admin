import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useGeneratePrompt, useTestPrompt } from '../api/admin-bot';
import { toast } from 'sonner';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Loader2,
  Wand2,
  FlaskConical,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

type PromptType = 'system' | 'user' | 'assistant';

export function PromptGenerator() {
  // Generation state
  const [idea, setIdea] = useState('');
  const [context, setContext] = useState('');
  const [promptType, setPromptType] = useState<PromptType>('system');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Test state
  const [testMessage, setTestMessage] = useState('What is Bitcoin?');
  const [testResult, setTestResult] = useState('');
  const [tokensUsed, setTokensUsed] = useState(0);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Mutations
  const generatePrompt = useGeneratePrompt();
  const testPrompt = useTestPrompt();

  const handleGenerate = async () => {
    if (!idea.trim()) {
      toast.error('Please enter an idea or description');
      return;
    }

    try {
      const result = await generatePrompt.mutateAsync({
        idea: idea.trim(),
        context: context.trim() || undefined,
        type: promptType,
      });

      setGeneratedPrompt(result.prompt);
      setTestResult('');
      setTokensUsed(0);
      toast.success('Prompt generated successfully!');
    } catch (error) {
      toast.error('Failed to generate prompt');
      console.error(error);
    }
  };

  const handleTest = async () => {
    if (!generatedPrompt.trim()) {
      toast.error('Generate a prompt first');
      return;
    }

    try {
      const result = await testPrompt.mutateAsync({
        prompt: generatedPrompt.trim(),
        testMessage: testMessage.trim() || undefined,
      });

      setTestResult(result.result);
      setTokensUsed(result.tokensUsed);
      toast.success('Prompt tested successfully!');
    } catch (error) {
      toast.error('Failed to test prompt');
      console.error(error);
    }
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;

    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setIdea('');
    setContext('');
    setGeneratedPrompt('');
    setTestResult('');
    setTokensUsed(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            Prompt Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate professional prompts from ideas using AI
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Input
            </CardTitle>
            <CardDescription>
              Describe your idea and let AI create a professional prompt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt Type */}
            <div className="space-y-2">
              <Label>Prompt Type</Label>
              <Select value={promptType} onValueChange={(v) => setPromptType(v as PromptType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <div className="flex flex-col items-start">
                      <span>System Prompt</span>
                      <span className="text-xs text-muted-foreground">Define AI personality and behavior</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex flex-col items-start">
                      <span>User Prompt</span>
                      <span className="text-xs text-muted-foreground">Template for user queries</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="assistant">
                    <div className="flex flex-col items-start">
                      <span>Assistant Prompt</span>
                      <span className="text-xs text-muted-foreground">Example assistant responses</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Idea */}
            <div className="space-y-2">
              <Label>
                Idea / Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Example: A friendly crypto assistant that explains complex blockchain concepts in simple terms, uses analogies, and always provides risk disclaimers..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                {idea.length} characters
              </p>
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label>Context (optional)</Label>
              <Input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., crypto beginners, DeFi traders, institutional investors"
              />
              <p className="text-xs text-muted-foreground">
                Target audience or specific use case
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generatePrompt.isPending || !idea.trim()}
              className="w-full"
            >
              {generatePrompt.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Prompt
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Output */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generated Prompt</CardTitle>
              {generatedPrompt && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {generatedPrompt.length} chars
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedPrompt ? (
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                className="min-h-[250px] font-mono text-sm"
              />
            ) : (
              <div className="min-h-[250px] flex items-center justify-center border rounded-md bg-muted/30">
                <div className="text-center text-muted-foreground">
                  <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Generated prompt will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Section */}
      {generatedPrompt && (
        <>
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-blue-500" />
                Test Prompt
              </CardTitle>
              <CardDescription>
                See how the AI responds with this prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="input" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="input">Test Input</TabsTrigger>
                  <TabsTrigger value="result" disabled={!testResult}>
                    Result {tokensUsed > 0 && `(${tokensUsed} tokens)`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="input" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Message</Label>
                    <div className="flex gap-2">
                      <Input
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="Enter a test message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleTest}
                        disabled={testPrompt.isPending}
                      >
                        {testPrompt.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Test
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will send the prompt + test message to AI and show the response
                    </p>
                  </div>

                  {/* Quick test messages */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick tests:</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'What is Bitcoin?',
                        'Explain DeFi',
                        'Is crypto safe?',
                        'Best time to buy?',
                        'How to stake ETH?',
                      ].map((msg) => (
                        <Badge
                          key={msg}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => setTestMessage(msg)}
                        >
                          {msg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="result" className="space-y-4">
                  {testResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">User</Badge>
                        <ArrowRight className="h-4 w-4" />
                        <span>{testMessage}</span>
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-500">AI Response</Badge>
                          {tokensUsed > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {tokensUsed} tokens
                            </Badge>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{testResult}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Run a test to see results</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Tips for better prompts</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Be specific about the desired tone (friendly, professional, technical)</li>
                <li>• Mention any constraints or things to avoid</li>
                <li>• Include the target audience for more tailored results</li>
                <li>• Use placeholders like {'{user_name}'}, {'{language}'}, {'{tier}'} for dynamic content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
