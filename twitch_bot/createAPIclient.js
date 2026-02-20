import { ApiClient } from '@twurple/api'
import { getAuthProvider } from '../auth/createRefreshToken.js'

export async function createApiClientTypes(tokenData, clientId) {

    const authProvider = await getAuthProvider(tokenData)

    const apiClient = await createApiClient(authProvider)

    return createHelixClient(apiClient, tokenData, clientId)
}

export async function createApiClient(authProvider) {
    const apiClient = new ApiClient({ authProvider });
    return apiClient
}

export async function createHelixClient(authProvider, info) {
    const apiClient = new ApiClient({ authProvider });

    const user = await apiClient.users.getUserById(info.userId); 
    return user
}