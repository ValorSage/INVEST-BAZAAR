# 3. إدارة الحالة (State Management)

إدارة الحالة هي الطريقة التي يتم بها تخزين البيانات وتحديثها ومشاركتها عبر مكونات التطبيق. في هذا المشروع، نعتمد على آليات React المدمجة وهوك مخصص.

## نظرة عامة

لا نستخدم مكتبة إدارة حالة خارجية مثل Redux أو MobX. بدلاً من ذلك، نعتمد على:
1.  **حالة مركزية** في المكون الرئيسي `App.tsx`.
2.  **تمرير الخصائص (Props Drilling)** لمشاركة الحالة والوظائف مع المكونات الفرعية.
3.  **هوك `useLocalStorage`** للحفاظ على الحالة بين جلسات المتصفح.

---

## 1. الحالة المركزية في `App.tsx`

المكون `App.tsx` يعمل كـ "مصدر الحقيقة الوحيد" (Single Source of Truth) لمعظم بيانات التطبيق الهامة.

```typescript
// داخل App.tsx
const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
const [points, setPoints] = useLocalStorage<number>(userDataKey('points'), 0);
const [jewels, setJewels] = useLocalStorage<number>(userDataKey('jewels'), 0);
const [notifications, setNotifications] = useLocalStorage<Notification[]>(userDataKey('notifications'), []);
const [chatRooms, setChatRooms] = useLocalStorage<ChatRoom[]>(globalDataKey('chatRooms'), []);
```

- **لماذا؟**: تجميع الحالة في مكان واحد يسهل تتبع البيانات وفهم تدفقها.
- **كيف يعمل؟**: `App.tsx` يمتلك كل من قيمة الحالة (مثل `points`) والدالة التي يمكنها تحديثها (`setPoints`).

---

## 2. تمرير الخصائص (Props Drilling)

بما أن الحالة موجودة في `App.tsx`، فإن الطريقة الوحيدة لوصول المكونات الفرعية إليها هي عن طريق تمريرها كـ `props`.

- **مثال**: مكون `Header.tsx` يحتاج إلى عرض عدد النقاط. في `App.tsx`، يتم تمريرها بهذا الشكل:
  ```jsx
  // في App.tsx
  <Header 
      points={points} 
      jewels={jewels}
      // ... props أخرى
  />
  ```

- **تمرير الوظائف**: لا يتم تمرير البيانات فقط، بل أيضًا الوظائف التي تقوم بتحديثها. على سبيل المثال، مكون `Store.tsx` يحتاج إلى طريقة لشراء عداد، مما يؤثر على رصيد النقاط.
  ```jsx
  // في App.tsx
  const handlePurchaseCounter = (counter: Counter) => {
      if (points >= counter.price) {
          setPoints(prevPoints => prevPoints - counter.price);
          // ... منطق آخر
      }
  };

  // ... في جزء العرض
  <Store 
      onPurchase={handlePurchaseCounter}
      userPoints={points}
      // ...
  />
  ```
  بهذه الطريقة، يبقى منطق تحديث الحالة في `App.tsx`، والمكونات الفرعية تطلب فقط تنفيذ هذا المنطق.

- **العيوب**: في التطبيقات الكبيرة، يمكن أن يصبح "Props Drilling" مرهقًا حيث قد تحتاج إلى تمرير خاصية عبر عدة طبقات من المكونات. لكن بالنسبة لحجم مشروعنا الحالي، فهو نهج بسيط وفعال.

---

## 3. الهوك المخصص `useLocalStorage`

هذا هو الجزء الأكثر أهمية في إدارة الحالة لهذا التطبيق، لأنه يجمع بين حالة React (`useState`) وتخزين المتصفح (`localStorage`).

- **الموقع**: `hooks/useLocalStorage.ts`
- **الوظيفة**:
  1.  **عند التحميل الأولي**: يقرأ القيمة من `localStorage` باستخدام المفتاح (key) المقدم. إذا لم يجد قيمة، فإنه يستخدم القيمة الافتراضية.
  2.  **عند التحديث**: كلما تغيرت قيمة الحالة (عبر دالة `setValue` التي يعيدها الهوك)، يقوم `useEffect` بتشغيل وحفظ القيمة الجديدة في `localStorage` بعد تحويلها إلى سلسلة JSON.
- **مثال للاستخدام**:
  ```typescript
  const [points, setPoints] = useLocalStorage<number>('points_user123', 0);
  ```
  هذا السطر الواحد يقوم بـ:
  - إنشاء متغير حالة `points`.
  - توفير دالة `setPoints` لتحديثه.
  - ضمان أن قيمة `points` يتم تحميلها من `localStorage` عند بدء التشغيل وحفظها فيه عند كل تغيير.

هذا الهوك هو ما يجعل التطبيق "يتذكر" تقدم المستخدم بين الجلسات بدون الحاجة إلى خادم.
