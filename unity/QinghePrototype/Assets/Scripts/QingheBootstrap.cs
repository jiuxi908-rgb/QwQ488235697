using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 空场景也能过关：自动建 Canvas + 5 个热区按钮，点击 Debug.Log。
/// 用法：空物体挂本脚本 → Play。
/// </summary>
public class QingheBootstrap : MonoBehaviour
{
    [Header("可选：清河底图 Sprite（没有则用纯色底）")]
    public Sprite backgroundSprite;

    [Header("热区显示名（仅 UI 文字）")]
    public string[] labels =
    {
        "客栈·市井",
        "老周",
        "医馆",
        "拳场·学艺",
        "官道·出城"
    };

    void Start()
    {
        EnsureEventSystem();
        var canvas = CreateCanvas();
        CreateBackground(canvas.transform);
        CreateHotspots(canvas.transform);
        Debug.Log("[QingheBootstrap] ready — click 5 hotspots, expect qinghe:* logs");
    }

    void EnsureEventSystem()
    {
        if (Object.FindObjectOfType<UnityEngine.EventSystems.EventSystem>() != null)
            return;
        var es = new GameObject("EventSystem");
        es.AddComponent<UnityEngine.EventSystems.EventSystem>();
        es.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
    }

    Canvas CreateCanvas()
    {
        var go = new GameObject("QingheCanvas");
        var canvas = go.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        go.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        go.AddComponent<GraphicRaycaster>();
        return canvas;
    }

    void CreateBackground(Transform parent)
    {
        var go = new GameObject("Background");
        go.transform.SetParent(parent, false);
        var rt = go.AddComponent<RectTransform>();
        StretchFull(rt);
        var img = go.AddComponent<Image>();
        if (backgroundSprite != null)
        {
            img.sprite = backgroundSprite;
            img.preserveAspect = true;
            img.color = Color.white;
        }
        else
        {
            img.color = new Color(0.12f, 0.09f, 0.07f, 1f);
        }
    }

    void CreateHotspots(Transform parent)
    {
        string[] actions = QingheActions.All;
        float[] anchorY = { 0.72f, 0.58f, 0.44f, 0.30f, 0.16f };
        Font font = LoadUiFont();

        for (int i = 0; i < actions.Length; i++)
        {
            string action = actions[i];
            string label = (labels != null && i < labels.Length) ? labels[i] : action;

            var go = new GameObject("HS_" + action.Replace(':', '_'));
            go.transform.SetParent(parent, false);

            var rt = go.AddComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.15f, anchorY[i] - 0.05f);
            rt.anchorMax = new Vector2(0.85f, anchorY[i] + 0.05f);
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;

            var img = go.AddComponent<Image>();
            img.color = new Color(0.85f, 0.68f, 0.38f, 0.35f);

            var btn = go.AddComponent<Button>();
            btn.targetGraphic = img;

            var textGo = new GameObject("Label");
            textGo.transform.SetParent(go.transform, false);
            var textRt = textGo.AddComponent<RectTransform>();
            StretchFull(textRt);
            var text = textGo.AddComponent<Text>();
            text.text = label + "  [" + action + "]";
            text.alignment = TextAnchor.MiddleCenter;
            text.color = new Color(0.96f, 0.91f, 0.81f);
            text.font = font;
            text.fontSize = 22;

            var hot = go.AddComponent<HotspotAction>();
            hot.actionId = action;
            btn.onClick.AddListener(hot.OnClick);
        }
    }

    static Font LoadUiFont()
    {
        Font f = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (f == null) f = Resources.GetBuiltinResource<Font>("Arial.ttf");
        return f;
    }

    static void StretchFull(RectTransform rt)
    {
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
    }
}
