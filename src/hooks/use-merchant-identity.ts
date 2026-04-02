import React from 'react';
import type { CategoryVisuals } from '@/types/visuals';
import { 
    getMerchantVisuals, 
    getMerchantLogoUrl, 
    getBackupLogoUrl, 
    getGoogleFaviconUrl, 
    markLogoAsFailed, 
    isLogoFailed 
} from '@/lib/merchant-utils';

/**
 * Logo source states for hierarchical fallback mechanism
 */
type LogoSource = "primary" | "secondary" | "tertiary" | "icon";

interface UseMerchantIdentityProps {
    /** The actual merchant name (if identified) */
    merchant?: string | null;
    /** Raw transaction description for fallback parsing */
    description: string;
    /** Primary category for visual fallback */
    category: string;
    /** Fn to lookup category visuals (icon, colors) */
    getCategoryVisuals: (name: string) => CategoryVisuals;
}

/**
 * Custom hook to manage the visual identity of a merchant/transaction.
 * Implements a hierarchical fallback mechanism:
 * 1. Primary Merchant Logo (Custom bucket)
 * 2. Secondary Merchant Logo (Backup bucket)
 * 3. Tertiary Merchant Logo (Google Favicon)
 * 4. Category/Merchant Default Icon
 *
 * @param props {@link UseMerchantIdentityProps}
 * @returns Object containing logo sources, fallback handler, and visual DNA
 */
export function useMerchantIdentity({
    merchant,
    description,
    category,
    getCategoryVisuals,
}: UseMerchantIdentityProps) {
    const merchantVisuals = getMerchantVisuals(merchant || description);
    const categoryVisuals = getCategoryVisuals(category);

    const [logoSource, setLogoSource] = React.useState<LogoSource>(() => {
        if (!merchantVisuals?.domain || isLogoFailed(merchantVisuals.domain)) {
            return 'icon';
        }
        return 'primary';
    });

    // Reset state ONLY when the actual merchant identity/domain changes
    const domainRef = React.useRef(merchantVisuals?.domain);
    React.useEffect(() => {
        if (merchantVisuals?.domain !== domainRef.current) {
            setLogoSource(
                merchantVisuals?.domain && !isLogoFailed(merchantVisuals.domain) 
                ? 'primary' 
                : 'icon'
            );
            domainRef.current = merchantVisuals?.domain;
        }
    }, [merchantVisuals?.domain]);

    const handleLogoError = React.useCallback(() => {
        setLogoSource((prev) => {
            if (prev === 'primary') return 'secondary';
            if (prev === 'secondary') return 'tertiary';
            
            // Final fallback to icon
            if (merchantVisuals?.domain) {
                markLogoAsFailed(merchantVisuals.domain);
            }
            return 'icon';
        });
    }, [merchantVisuals?.domain]);

    const primaryLogo = merchantVisuals?.domain ? getMerchantLogoUrl(merchantVisuals.domain) : null;
    const backupLogo = merchantVisuals?.domain ? getBackupLogoUrl(merchantVisuals.domain) : null;
    const googleLogo = merchantVisuals?.domain ? getGoogleFaviconUrl(merchantVisuals.domain) : null;

    // Hierarchy: Merchant Visuals > Category Visuals
    const DefaultIcon = merchantVisuals?.icon || categoryVisuals.icon;
    const iconColor = merchantVisuals?.color || categoryVisuals.color;
    const iconBg = merchantVisuals?.bgColor || categoryVisuals.bgColor;

    return {
        logoSource,
        handleLogoError,
        primaryLogo,
        backupLogo,
        googleLogo,
        DefaultIcon,
        iconColor,
        iconBg,
        merchantVisuals,
        categoryVisuals,
    };
}
