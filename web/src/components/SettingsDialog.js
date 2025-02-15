import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SettingsDialog({
    open,
    onOpenChange,
    username,
    onUsernameChange,
    selectedModel,
    onModelChange,
    maxTokens,
    onMaxTokensChange,
    wordLimit,
    onWordLimitChange,
    models,
    users
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-blue-500" />
                        Settings
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <Select value={username} onValueChange={onUsernameChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a username" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user, index) => (
                                    <SelectItem key={index} value={user}>
                                        {user}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Summarizer Model</label>
                        <Select value={selectedModel} onValueChange={onModelChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((model, index) => (
                                    <SelectItem key={index} value={model.model}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">
                                Summarizer Model Context Window
                            </label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Assuming a 4k token model, reduced by 100 tokens to accommodate summary generation instructions.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Input
                            type="number"
                            value={maxTokens}
                            onChange={(e) => onMaxTokensChange(e.target.value)}
                            placeholder="Enter max tokens"
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Desired Summary Word Count
                        </label>
                        <Input
                            type="number"
                            value={wordLimit}
                            onChange={(e) => onWordLimitChange(e.target.value)}
                            placeholder="Enter word limit"
                            className="w-full"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 