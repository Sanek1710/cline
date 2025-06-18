import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { memo } from "react"

const AutocompletionSettingsSection = () => {
	const { apiConfiguration, setApiConfiguration } = useExtensionState()

	const handleProviderChange = (e: any) => {
		const provider = e.target.value
		setApiConfiguration({
			...(apiConfiguration || {}),
			apiProvider: provider,
			// Reset model-specific fields when changing provider
			openAiModelId: provider === "openai" ? apiConfiguration?.openAiModelId : undefined,
			ollamaModelId: provider === "ollama" ? apiConfiguration?.ollamaModelId : undefined,
		})
	}

	const handleModelChange = (e: any) => {
		const modelId = e.target.value
		if (!apiConfiguration) return

		if (apiConfiguration.apiProvider === "openai") {
			setApiConfiguration({
				...apiConfiguration,
				openAiModelId: modelId,
			})
		} else if (apiConfiguration.apiProvider === "ollama") {
			setApiConfiguration({
				...apiConfiguration,
				ollamaModelId: modelId,
			})
		}
	}

	return (
		<div style={{ marginBottom: 20 }}>
			<div style={{ marginBottom: 15 }}>
				<label htmlFor="autocompletion-provider" style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
					Autocompletion Provider
				</label>
				<VSCodeDropdown
					id="autocompletion-provider"
					value={apiConfiguration?.apiProvider || "openai"}
					onChange={handleProviderChange}
					style={{ width: "100%" }}>
					<VSCodeOption value="openai">OpenAI</VSCodeOption>
					<VSCodeOption value="ollama">Ollama</VSCodeOption>
				</VSCodeDropdown>
				<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: "5px 0 0 0" }}>
					Select the provider to use for code completions. This is separate from the chat model settings.
				</p>
			</div>

			{apiConfiguration?.apiProvider === "openai" && (
				<div style={{ marginBottom: 15 }}>
					<label htmlFor="openai-model" style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
						OpenAI Model
					</label>
					<VSCodeTextField
						id="openai-model"
						value={apiConfiguration?.openAiModelId || ""}
						onInput={(e: any) => {
							setApiConfiguration({
								...(apiConfiguration || {}),
								openAiModelId: e.target.value,
							})
						}}
						placeholder="Enter OpenAI model ID (e.g., gpt-4-turbo-preview)"
						style={{ width: "100%" }}
					/>
					<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: "5px 0 0 0" }}>
						Enter the OpenAI model ID to use for completions. This is separate from the chat model.
					</p>
				</div>
			)}

			{apiConfiguration?.apiProvider === "ollama" && (
				<div style={{ marginBottom: 15 }}>
					<label htmlFor="ollama-model" style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
						Ollama Model
					</label>
					<VSCodeTextField
						id="ollama-model"
						value={apiConfiguration?.ollamaModelId || ""}
						onInput={(e: any) => {
							setApiConfiguration({
								...(apiConfiguration || {}),
								ollamaModelId: e.target.value,
							})
						}}
						placeholder="Enter Ollama model name (e.g., codellama)"
						style={{ width: "100%" }}
					/>
					<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: "5px 0 0 0" }}>
						Enter the Ollama model name to use for completions. This is separate from the chat model.
					</p>
				</div>
			)}

			{apiConfiguration?.apiProvider === "openai" && (
				<div style={{ marginBottom: 15 }}>
					<label htmlFor="openai-api-key" style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
						OpenAI API Key
					</label>
					<VSCodeTextField
						id="openai-api-key"
						value={apiConfiguration?.openAiApiKey || ""}
						onInput={(e: any) => {
							setApiConfiguration({
								...(apiConfiguration || {}),
								openAiApiKey: e.target.value,
							})
						}}
						type="password"
						placeholder="Enter OpenAI API key"
						style={{ width: "100%" }}
					/>
					<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: "5px 0 0 0" }}>
						Your OpenAI API key for authentication. This is shared with the chat feature.
					</p>
				</div>
			)}

			{apiConfiguration?.apiProvider === "ollama" && (
				<div style={{ marginBottom: 15 }}>
					<label htmlFor="ollama-base-url" style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
						Ollama Base URL
					</label>
					<VSCodeTextField
						id="ollama-base-url"
						value={apiConfiguration?.ollamaBaseUrl || "http://localhost:11434"}
						onInput={(e: any) => {
							setApiConfiguration({
								...(apiConfiguration || {}),
								ollamaBaseUrl: e.target.value,
							})
						}}
						placeholder="Enter Ollama base URL"
						style={{ width: "100%" }}
					/>
					<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: "5px 0 0 0" }}>
						The base URL where your Ollama server is running. This is shared with the chat feature.
					</p>
				</div>
			)}
		</div>
	)
}

export default memo(AutocompletionSettingsSection)
