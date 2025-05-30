import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthProvider from '../../components/auth-provider'

test('renders AuthProvider component', () => {
    render(
        <AuthProvider>
            <div>Test content</div>
        </AuthProvider>
    )
    const testElement = screen.getByText(/test content/i)
    expect(testElement).toBeInTheDocument()
})