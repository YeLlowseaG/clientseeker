import WechatPay from 'wechatpay-node-v3';

export interface WeChatOrderData {
  out_trade_no: string;
  description: string;
  amount: {
    total: number;
    currency: string;
  };
  notify_url: string;
}

export interface WeChatNativeOrder {
  code_url: string;
  prepay_id: string;
}

export class WeChatPayClient {
  private client: WechatPay;
  private appid: string;
  private mchid: string;

  constructor() {
    this.appid = process.env.WECHAT_PAY_APP_ID || '';
    this.mchid = process.env.WECHAT_PAY_MCH_ID || '';

    if (!this.appid || !this.mchid) {
      throw new Error('WeChat Pay configuration missing');
    }

    // 初始化微信支付客户端
    this.client = new WechatPay({
      appid: this.appid,
      mchid: this.mchid,
      publicKey: Buffer.from(process.env.WECHAT_PAY_PUBLIC_KEY || '', 'utf8'), // 微信支付平台证书
      privateKey: Buffer.from(process.env.WECHAT_PAY_PRIVATE_KEY || '', 'utf8'), // 商户私钥
      key: process.env.WECHAT_PAY_API_V3_KEY || '', // APIv3密钥
    });
  }

  /**
   * 创建Native支付订单
   */
  async createNativeOrder(orderData: WeChatOrderData): Promise<WeChatNativeOrder> {
    try {
      console.log('🔍 [WeChat Pay] Creating Native order:', {
        out_trade_no: orderData.out_trade_no,
        amount: orderData.amount,
        description: orderData.description
      });

      const params = {
        appid: this.appid,
        mchid: this.mchid,
        description: orderData.description,
        out_trade_no: orderData.out_trade_no,
        notify_url: orderData.notify_url,
        amount: {
          total: orderData.amount.total,
          currency: orderData.amount.currency || 'CNY',
        },
      };

      const result = await this.client.transactions_native(params);
      
      console.log('🔍 [WeChat Pay] Native order created successfully:', result);
      
      if (!result.data || !result.data.code_url) {
        throw new Error('Failed to get code_url from WeChat Pay response');
      }
      
      return {
        code_url: result.data.code_url,
        prepay_id: result.data.prepay_id || '',
      };
    } catch (error: any) {
      console.error('🔍 [WeChat Pay] Failed to create Native order:', error);
      throw new Error(`WeChat Pay order creation failed: ${error.message}`);
    }
  }

  /**
   * 查询订单状态
   */
  async queryOrder(outTradeNo: string): Promise<any> {
    try {
      console.log('🔍 [WeChat Pay] Querying order:', outTradeNo);
      
      const result = await this.client.query({
        out_trade_no: outTradeNo,
      });
      
      console.log('🔍 [WeChat Pay] Order query result:', result);
      
      if (!result.data) {
        throw new Error('Failed to get order data from WeChat Pay response');
      }
      
      return result.data;
    } catch (error: any) {
      console.error('🔍 [WeChat Pay] Failed to query order:', error);
      throw new Error(`WeChat Pay order query failed: ${error.message}`);
    }
  }

  /**
   * 关闭订单
   */
  async closeOrder(outTradeNo: string): Promise<boolean> {
    try {
      console.log('🔍 [WeChat Pay] Closing order:', outTradeNo);
      
      const result = await this.client.close(outTradeNo);
      
      console.log('🔍 [WeChat Pay] Close order result:', result);
      
      console.log('🔍 [WeChat Pay] Order closed successfully');
      return true;
    } catch (error: any) {
      console.error('🔍 [WeChat Pay] Failed to close order:', error);
      return false;
    }
  }

  /**
   * 验证回调签名
   */
  async verifyNotification(headers: any, body: string): Promise<boolean> {
    try {
      // 使用SDK内置的签名验证
      return await this.client.verifySign({
        timestamp: headers['wechatpay-timestamp'],
        nonce: headers['wechatpay-nonce'],
        body: body,
        serial: headers['wechatpay-serial'],
        signature: headers['wechatpay-signature'],
      });
    } catch (error) {
      console.error('🔍 [WeChat Pay] Signature verification failed:', error);
      return false;
    }
  }

  /**
   * 解密回调数据
   */
  decryptNotification(encryptedData: any): any {
    try {
      return this.client.decipher_gcm(
        encryptedData.ciphertext,
        encryptedData.associated_data,
        encryptedData.nonce
      );
    } catch (error) {
      console.error('🔍 [WeChat Pay] Failed to decrypt notification:', error);
      throw error;
    }
  }
}