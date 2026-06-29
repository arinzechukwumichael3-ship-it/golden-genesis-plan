-- Update existing wallet addresses
UPDATE public.crypto_wallets SET wallet_address = 'bc1qp2wcrrp9cyhkln0m69aaat3qepjnh4k7va0ymu' 
  WHERE symbol = 'BTC' AND network = 'Bitcoin';

UPDATE public.crypto_wallets SET wallet_address = 'TAQTQPDYWs89HQUfhGkJiD6XjQ3AfFSb3K' 
  WHERE symbol = 'USDT' AND network = 'TRC20';

UPDATE public.crypto_wallets SET wallet_address = '0xb4d5697d4d9fa589f1f45c529b76baf52a5d0d27' 
  WHERE symbol = 'USDT' AND network = 'BEP20';

UPDATE public.crypto_wallets SET wallet_address = '0xb4d5697d4d9fa589f1f45c529b76baf52a5d0d27' 
  WHERE symbol = 'ETH' AND network = 'ERC20';

-- Add BCH (Bitcoin Cash) wallet
INSERT INTO public.crypto_wallets (coin_name, symbol, network, wallet_address, is_active, sort_order)
  VALUES ('Bitcoin Cash', 'BCH', 'Bitcoin', '33QdosyKXZajSmTFSdh4Ng5wSNYqPJUpyj', true, 7)
ON CONFLICT (symbol, network) DO UPDATE SET wallet_address = EXCLUDED.wallet_address;

-- Deactivate TRX and ERC20 USDT (not specified by user)
UPDATE public.crypto_wallets SET is_active = false WHERE symbol = 'TRX' AND network = 'TRC20';
UPDATE public.crypto_wallets SET is_active = false WHERE symbol = 'USDT' AND network = 'ERC20';