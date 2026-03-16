import authorize from './auth.js';

authorize()
  .then(() => {
    console.log('✅ 授權完成');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ 授權失敗：', e?.response?.data || e);
    process.exit(1);
  });
